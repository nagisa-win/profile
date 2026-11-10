/** 页面渲染函数：把 profile 配置转换为 HTML 字符串（纯函数，无依赖） */

/** 转义 HTML 特殊字符 */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** 转义后把 **text** 换成高亮标签 */
export const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<em class="hl">$1</em>');

/** 只放行 http(s) / 站内锚点 / assets / infoflow / mailto，其余一律降级为 # */
export const url = (u) => (/^(https?:|infoflow:|#|assets\/|mailto:)/i.test(String(u)) ? esc(u) : '#');

/** 区块标题 */
const head = (no, title, sub) =>
  `<div class="sec-head reveal"><span class="no">${no} //</span><h2>${esc(title)}</h2><span class="sub">${esc(sub)}</span></div>`;

/** 内容区装饰图：支持一张或多张，保持图片与文字分开维护 */
const art = (a, cls = 'entry-art') => {
  const list = Array.isArray(a) ? a : (a ? [a] : []);
  if (!list.length) return '';
  return `<figure class="${cls}${list.length > 1 ? ' gallery' : ''}">${list.map((x) => `<img src="${url(x.src)}" alt="${esc(x.alt || '')}" loading="lazy" decoding="async">`).join('')}</figure>`;
};

/** 01 Hero + 身份卡 */
export function hero(P) {
  const h = P.hero;
  const c = P.idcard;
  const btns = h.buttons.map((b) => `<a class="btn${b.ghost ? ' ghost' : ''}" href="${url(b.href)}">${esc(b.text)}</a>`).join('');
  const rows = c.rows.map(([k, v, hl]) => `<dt>${esc(k)}</dt><dd${hl ? ' class="hl"' : ''}>${esc(v)}</dd>`).join('');
  return `<section class="hero" id="id">
    <div class="reveal">
      <div class="eyebrow">${esc(h.eyebrow)}</div>
      <h1 class="glitch" data-text="${esc(h.name)}">${esc(h.name)}<span class="cn">${esc(h.subtitle)}</span></h1>
      <p class="tagline">${rich(h.tagline)}</p>
      <div class="typed" id="typed"></div>
      <div class="cta">${btns}</div>
    </div>
    <aside class="idcard reveal" id="idcard">
      <div class="top"><span>MERC LICENSE</span><b>${esc(c.status)}</b></div>
      <div class="avatar"><img src="${url(c.avatar)}" alt="${esc(c.avatarAlt)}"></div>
      <dl>${rows}</dl>
      <div class="barcode"></div>
    </aside>
  </section>`;
}

/** 02 链接分组 */
export function links(P) {
  const L = P.links;
  if (!L.groups?.length) return '';
  const item = (i) => `<a class="lnk" href="${url(i.url)}" target="_blank" rel="noopener">${i.badge ? `<span class="lock${i.open ? ' open' : ''}">${esc(i.badge)}</span>` : ''}<div class="k">${esc(i.kind)}</div><div class="t">${esc(i.title)}</div><div class="d">${esc(i.desc)}</div></a>`;
  const groups = L.groups.map((g) => `<div class="group-label">${esc(g.label)}</div><div class="links">${g.items.map(item).join('')}</div>`).join('');
  return `<section id="net">${head('02', L.title, L.sub)}<div class="reveal">${groups}</div></section>`;
}

/** 03 属性面板（标签 + 进度条）与破解按钮 */
export function stats(P) {
  const S = P.stats;
  const panel = (p, cls) => {
    const tags = p.tags.map((t) => `<span class="tag${cls}">${esc(t)}</span>`).join('')
      + (p.redacted || []).map((t) => `<span class="tag redacted">${esc(t)}</span>`).join('');
    const meters = p.meters.map(([n, v, w]) => `<div class="row"><span>${esc(n)}</span><span>${esc(v)}</span></div><div class="track"><div class="fill" data-w="${+w}"></div></div>`).join('');
    return `<div class="panel"><div class="ptitle">${esc(p.title)}</div><div class="tags">${tags}</div><div class="meter">${meters}</div></div>`;
  };
  const breach = (S.breach || []).map((b) => `<div class="panel breach${b.danger ? ' danger' : ''}" data-facts="${esc(JSON.stringify(b.facts))}"><div class="ptitle">${esc(b.title)}</div><div class="hint">${esc(b.hint)}</div><button type="button">${esc(b.button)}</button><div class="prog"></div></div>`).join('');
  return `<section id="stats">${head('03', S.title, S.sub)}<div class="stats reveal">${panel(S.left, '')}${panel(S.right, ' c')}</div>${breach ? `<div class="breach-wrap reveal">${breach}</div>` : ''}</section>`;
}

/** 04 About me 日志 */
export function about(P) {
  const A = P.about;
  const entry = (e, i) => {
    const body = e.body ? `<p${e.terminal ? ' class="terminal"' : ''}>${rich(e.body)}</p>` : '';
    const list = e.list ? `<ul>${e.list.map((x) => `<li>${rich(x)}</li>`).join('')}</ul>` : '';
    const chips = e.chips ? `<div class="chip-row">${e.chips.map((c) => `<span class="tag">${esc(c)}</span>`).join('')}</div>` : '';
    return `<div class="entry panel${e.art ? ' has-art' : ''}"><div class="stamp">LOG_${String(i + 1).padStart(2, '0')}</div><div class="entry-body"><h3>${rich(e.head)}</h3>${body}${list}${chips}</div>${art(e.art)}</div>`;
  };
  return `<section id="about">${head('04', A.title, A.sub)}
    <div class="panel reveal" style="margin-bottom:22px"><p class="quote">${esc(A.quote.text)}<small>${esc(A.quote.note)}</small></p></div>
    <div class="log reveal">${A.entries.map(entry).join('')}</div></section>`;
}

/** 05 脑图容器（节点由前端脚本绘制，移动端用列表兜底） */
export function neuro(P) {
  const N = P.neuro;
  const list = N.branches.map((b) => `<li><span>${esc(b.text)}</span>${b.children.map(esc).join(' / ')}</li>`).join('');
  return `<section id="neuro">${head('05', N.title, N.sub)}<div class="panel reveal"><div class="neuro" id="neuroMap"></div><ul class="facts neuro-list">${list}</ul></div></section>`;
}
