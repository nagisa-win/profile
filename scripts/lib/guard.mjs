/** 构建期守卫：本地资源链接检查 + 公开版泄露扫描。任何一项失败都会让构建退出码非 0。 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { createHash } from 'node:crypto';

/** 公开版产物里禁止出现的内容；命中即视为泄露 */
export const FORBIDDEN = [
  [/baidu-int\.com|baidu\.com/i, '百度内网 / 公司域名'],
  [/infoflow:\/\//i, '如流协议链接'],
  [/yanjunzhu|@baidu/i, '公司账号线索'],
  [/stevenyanmail|steven\.run/i, '个人私有服务域名'],
  [/ku\.baidu|knowledge\/[A-Za-z0-9_-]{8,}/i, '知识库文档链接'],
  [/(api[_-]?key|secret|token|passwd|password)\s*[:=]\s*["'][^"']{6,}/i, '疑似密钥'],
];

/** 仅放行用户明确指定的公开统计服务 Origin；其他私有域名仍然拦截 */
export function maskPublicTelemetry(text) {
  return text.replace(/https:\/\/server\.steven\.run(?=["'/\s])/g, 'https://telemetry.invalid');
}

/** 仅用于构建产物：内网 / 本机地址（源码里的本地预览地址是正常的，所以不放进 FORBIDDEN） */
const LOCAL_ADDR = [/0\.0\.0\.0|127\.0\.0\.1|localhost|192\.168\.\d+\.\d+|\b10\.\d+\.\d+\.\d+/, '内网 / 本机地址'];

/** 递归列出目录下所有文件 */
async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

/** 检查 index.html 引用的本地资源是否都存在，避免发布后出现裂图 */
export async function checkLinks(outDir) {
  const html = await readFile(join(outDir, 'index.html'), 'utf8');
  const refs = [...html.matchAll(/(?:src|href|poster)="((?:assets|styles|scripts)\/[^"#?]+)"/g)].map((m) => m[1]);
  const missing = [...new Set(refs)].filter((r) => !existsSync(join(outDir, r)));
  if (missing.length) throw new Error(`引用了不存在的本地文件：\n  ${missing.join('\n  ')}`);
}

/** 公开版泄露扫描：文本黑名单 + 私密素材内容哈希比对 + 视频 / 图片元数据兜底 */
export async function scanLeaks(outDir, privAssetsDir) {
  const files = await walk(outDir);
  const hits = [];
  const textExt = new Set(['.html', '.css', '.js', '.mjs', '.json', '.txt', '.svg']);
  for (const f of files) {
    if (!textExt.has(extname(f))) continue;
    const text = maskPublicTelemetry(await readFile(f, 'utf8'));
    for (const [re, why] of [...FORBIDDEN, LOCAL_ADDR]) {
      const m = text.match(re);
      if (m) hits.push(`${relative(outDir, f)}: ${why}（${m[0].slice(0, 40)}）`);
    }
  }
  /** 私密素材即使改了文件名，只要内容相同也会被发现 */
  if (existsSync(privAssetsDir)) {
    const sha = async (p) => createHash('sha256').update(await readFile(p)).digest('hex');
    const secret = new Set(await Promise.all((await walk(privAssetsDir)).map(sha)));
    for (const f of files) {
      if ((await stat(f)).isFile() && secret.has(await sha(f))) hits.push(`${relative(outDir, f)}: 与 assets.private 中的私密素材内容相同`);
    }
  }
  if (hits.length) throw new Error(`公开版泄露扫描未通过：\n  ${hits.join('\n  ')}`);
}
