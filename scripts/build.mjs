/** 双版本静态站点构建：src/ → dist/public（公开版）+ dist/internal（内网完整版） */
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { esc } from './lib/render.mjs';
import * as A from './lib/render.mjs';
import * as B from './lib/render-tail.mjs';
import { merge } from './lib/merge.mjs';
import { checkLinks, scanLeaks } from './lib/guard.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');
export const TARGETS = ['public', 'internal'];

/** 区块顺序与导航：key 对应配置里的顶层字段，缺失的区块会被跳过 */
const SECTIONS = [
  { key: 'hero', id: 'id', nav: 'ID', render: A.hero },
  { key: 'links', id: 'net', nav: 'NETWORK', render: A.links },
  { key: 'stats', id: 'stats', nav: 'STATS', render: A.stats },
  { key: 'about', id: 'about', nav: 'LOG', render: A.about },
  { key: 'neuro', id: 'neuro', nav: 'NEURO', render: A.neuro },
  { key: 'media', id: 'ride', nav: 'RIDE', render: B.media },
  { key: 'contact', id: 'ping', nav: 'PING', render: B.contact },
  { key: 'community', id: 'rep', nav: 'CRED', render: B.community },
];

/** 读取配置模块；加时间戳参数绕过 ESM 缓存，dev 模式才能热更新 */
const load = async (file) => (await import(pathToFileURL(file).href + `?t=${Date.now()}`)).default;

/** 公开版只读公开配置；内网版在其上叠加 profile.private.mjs（不存在则退化为公开版） */
async function loadProfile(target) {
  const base = await load(join(src, 'content/profile.mjs'));
  const priv = join(src, 'content/profile.private.mjs');
  if (target === 'public') return base;
  if (!existsSync(priv)) {
    console.warn('! 未找到 profile.private.mjs，内网版与公开版内容相同');
    return base;
  }
  return merge(base, await load(priv));
}

/** 构建单个版本；公开版额外执行泄露扫描 */
export async function build(target) {
  const out = join(dist, target);
  const P = await loadProfile(target);

  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await cp(join(src, 'assets'), join(out, 'assets'), { recursive: true });
  /** 私密素材只进内网版，覆盖同名公开素材 */
  const privAssets = join(src, 'assets.private');
  if (target === 'internal' && existsSync(privAssets)) await cp(privAssets, join(out, 'assets'), { recursive: true });
  await cp(join(src, 'styles'), join(out, 'styles'), { recursive: true });
  await cp(join(src, 'scripts'), join(out, 'scripts'), { recursive: true });

  const active = SECTIONS.filter((s) => P[s.key]);
  const data = { typed: P.hero?.typed ?? [], neuro: P.neuro ?? null };
  const dataTag = `<script type="application/json" id="profile-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>\n`;
  const vars = {
    title: esc(P.meta.title),
    description: esc(P.meta.description),
    favicon: esc(P.meta.favicon),
    bootLogo: `${esc(P.hero.name)}<span>.</span>EXE`,
    brand: `${esc(P.meta.brand[0])}<b>${esc(P.meta.brand[1])}</b>${esc(P.meta.brand[2])}`,
    nav: active.map((s) => `<a href="#${s.id}">${s.nav}</a>`).join(''),
    sections: active.map((s) => s.render(P)).join('\n'),
    footer: P.footer ? B.footer(P) : '',
  };
  const tpl = await readFile(join(src, 'templates/layout.html'), 'utf8');
  /** 用函数形式替换，避免内容里的 $& 之类被当成替换模式 */
  const html = tpl
    .replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '')
    .replace('<script src="scripts/main.js">', () => `${dataTag}<script src="scripts/main.js">`);
  await writeFile(join(out, 'index.html'), html);
  /** GitHub Pages 需要 .nojekyll */
  await writeFile(join(out, '.nojekyll'), '');

  await checkLinks(out);
  if (target === 'public') await scanLeaks(out, join(src, 'assets.private'));
  console.log(`built ${target} → dist/${target} (${active.length} sections)`);
}

/** CLI：node scripts/build.mjs [public|internal|all]，默认 all */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2] || 'all';
  const list = arg === 'all' ? TARGETS : [arg];
  if (list.some((t) => !TARGETS.includes(t))) throw new Error(`target must be ${TARGETS.join('|')}|all`);
  for (const t of list) await build(t);
}
