/**
 * 提交前检查：扫描「将要被提交」的文件（已跟踪 + 未忽略的新文件），发现内网信息或私密文件就退出码 1。
 * 用法：npm run check；由 .githooks/pre-commit 和 CI 调用。
 */
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORBIDDEN, maskPublicTelemetry } from './lib/guard.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
/** 规则文件本身包含黑名单正则，需要跳过 */
const SKIP = new Set(['scripts/lib/guard.mjs', 'scripts/check.mjs']);
/** 这些路径永远不能出现在提交里 */
const PRIVATE = [/(^|\/)profile\.private\.mjs$/, /^src\/assets\.private\//, /^dist\//, /^raw\//, /\.env/];
const BINARY = /\.(webp|png|jpe?g|gif|mp4|mov|ico|woff2?)$/i;

const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);

/** 只有一个 git 仓库时才有意义；非仓库环境直接提示跳过 */
let files;
try {
  files = [...new Set([...git('ls-files', '--cached'), ...git('ls-files', '--others', '--exclude-standard')])];
} catch {
  console.log('check: 不在 git 仓库内，跳过');
  process.exit(0);
}

const hits = [];
for (const f of files) {
  if (PRIVATE.some((re) => re.test(f))) hits.push(`${f}: 私密 / 产物文件不应被提交`);
  if (SKIP.has(f) || BINARY.test(f)) continue;
  let text;
  try { text = await readFile(join(root, f), 'utf8'); } catch { continue; }
  for (const [re, why] of FORBIDDEN) {
    const m = maskPublicTelemetry(text).match(re);
    if (m) hits.push(`${f}: ${why}（${m[0].slice(0, 40)}）`);
  }
}

if (hits.length) {
  console.error(`✗ 提交前检查未通过：\n  ${hits.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ 提交前检查通过（${files.length} 个文件）`);
