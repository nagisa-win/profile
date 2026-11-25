/**
 * 开源档案区块：渲染 src/data/projects.json 生成的白名单仓库。
 * 数据由 scripts/sync-projects.mjs 每夜同步，这里只负责排版，不持有任何业务清单。
 */
import { esc, url, head } from './render.mjs';

/** 单张仓库卡片：整卡跳到仓库，LIVE 标记与站点链接单独可点 */
const card = (p) => {
  const live = p.live ? `<a class="proj-live" href="${url(p.live)}" target="_blank" rel="noopener">LIVE ↗</a>` : '';
  const lang = p.language ? esc(p.language) : '—';
  return `<div class="lnk proj">
    <div class="k">★ ${esc(p.stars)} · ${lang}</div>
    <div class="t">${esc(p.repo)}${live}</div>
    <div class="d">${esc(p.desc)}</div>
    <div class="meta"><span>${esc(p.updated)}</span>${p.archived ? '<span class="warn">ARCHIVED</span>' : ''}</div>
    <a class="proj-hit" href="${url(p.url)}" target="_blank" rel="noopener" aria-label="${esc(p.repo)} 仓库"></a>
  </div>`;
};

export function projects(P) {
  const data = P.projectsData;
  if (!data?.groups?.length) return '';

  const body = data.groups
    .map((g) => `<div class="group-label">[ ${esc(g.label)} ]</div><div class="links">${g.items.map(card).join('')}</div>`)
    .join('');

  return `<section id="repo">${head('03', '开源档案', `PUBLIC REPOS · 共 ${data.groups.reduce((n, g) => n + g.items.length, 0)} 个 · 每日自动同步`)}<div class="reveal">${body}</div></section>`;
}
