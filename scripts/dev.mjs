/** 本地开发服务：监听 src/ 自动重建，预览 dist/<版本>。node scripts/dev.mjs [internal|public]，默认 internal */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, watch } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, TARGETS } from './build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2] || 'internal';
if (!TARGETS.includes(target)) throw new Error(`target must be ${TARGETS.join('|')}`);
const pub = join(root, 'dist', target);
const port = +process.env.PORT || 8765;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.mp4': 'video/mp4', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };

/** 重建失败只打印，不让预览服务退出 */
const rebuild = () => build(target).catch((e) => console.error(`\n✗ ${e.message}\n`));
await rebuild();

/** 防抖重建，避免一次保存触发多次构建 */
let timer;
watch(join(root, 'src'), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 150);
});

createServer((req, res) => {
  const rel = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(pub, rel);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!file.startsWith(pub) || !existsSync(file)) { res.writeHead(404).end('Not found'); return; }
  const size = statSync(file).size;
  const range = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
  const type = { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
  /** 视频拖动进度条需要 Range 支持 */
  if (range) {
    const start = +range[1];
    const end = range[2] ? +range[2] : size - 1;
    res.writeHead(206, { ...type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    createReadStream(file, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { ...type, 'Content-Length': size });
    createReadStream(file).pipe(res);
  }
}).listen(port, () => console.log(`preview [${target}] → http://127.0.0.1:${port}  (watching src/)`));
