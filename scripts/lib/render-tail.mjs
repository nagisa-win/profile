/** 后半段区块渲染：媒体 / 联络 / 社区数据 / 页脚 */
import { esc, rich, url } from './render.mjs';

const head = (no, title, sub) =>
  `<div class="sec-head reveal"><span class="no">${no} //</span><h2>${esc(title)}</h2><span class="sub">${esc(sub)}</span></div>`;

/** 06 视频与嵌入页 */
export function media(P) {
  const M = P.media;
  const vid = (v) => `<div class="vid${v.tall ? ' tall' : ''}"><span class="cap">${esc(v.cap)}</span><video src="${url(v.src)}" poster="${url(v.poster)}" controls playsinline preload="metadata"${v.muted ? ' muted' : ''}${v.loop ? ' loop' : ''}></video></div>`;
  const [first, ...rest] = M.videos;
  const embed = M.embed
    ? `<div class="embed-frame"><div class="embed-bar"><span><b>LIVE FEED</b> · ${esc(M.embed.label)}</span><a href="${url(M.embed.url)}" target="_blank" rel="noopener">在新窗口打开 ↗</a></div><iframe src="${url(M.embed.url)}" loading="lazy" title="${esc(M.embed.label)}" referrerpolicy="no-referrer"></iframe></div>`
    : '';
  return `<section id="ride">${head('06', M.title, M.sub)}<div class="media reveal">${vid(first)}<div class="side-stack">${rest.map(vid).join('')}${embed}</div></div></section>`;
}

/** 07 联络终端，午休时段通过 data 属性交给前端脚本 */
export function contact(P) {
  const C = P.contact;
  const lines = C.lines.map((l, i) => `<p class="ln${i === 0 ? ' warn' : ''}">&gt; ${esc(l)}</p>`).join('');
  return `<section id="ping">${head('07', C.title, C.sub)}<div class="contact reveal">
    <div class="panel terminal" data-nap-start="${+C.napStart}" data-nap-end="${+C.napEnd}">
      <div class="ptitle">AVAILABILITY.LOG</div>
      <img class="ok-gif" src="${url(C.okImage)}" alt="" loading="lazy">
      <p class="ln"><b>$</b> status --now</p>
      <p class="ln" id="napState">&gt; 正在检测…</p>${lines}
      <p class="ln"><b>$</b> _</p>
    </div>
    <div class="panel" style="display:flex;flex-direction:column;justify-content:center;gap:18px">
      <div class="ptitle">${esc(C.channel.title)}</div>
      <p style="color:#c4c8cf">${esc(C.channel.text)}</p>
      <div><a class="btn" href="${url(C.channel.href)}">${esc(C.channel.button)}</a></div>
      ${C.channel.note ? `<p style="font-family:var(--mono);font-size:12px;color:var(--mute)">${esc(C.channel.note)}</p>` : ''}
    </div></div></section>`;
}

/** 实时访问统计：内网 POPO 身份 / 公开设备哈希，历史趋势按需展开 */
function telemetry(T) {
  if (!T) return '';
  const dashboard = `${T.service}/doc-status/${encodeURIComponent(T.docId)}`;
  const note = T.userMode === 'popo'
    ? '使用 POPO 用户信息计数，不读取部门、正文或评论。'
    : '设备特征仅在本机计算不可逆哈希用于访客计数，原始特征不上传。';
  return `<div class="telemetry panel reveal" id="telemetry" data-doc-id="${esc(T.docId)}" data-doc-name="${esc(T.docName)}" data-service="${url(T.service)}" data-user-mode="${esc(T.userMode)}">
    <div class="telemetry-head"><div><div class="ptitle">LIVE TRAFFIC // 访问统计</div><p>${esc(note)}</p></div><span class="telemetry-status" data-telemetry-status>CONNECTING…</span></div>
    <div class="telemetry-totals"><div><strong data-total="pv">—</strong><span>累计 PV</span></div><div><strong data-total="uv">—</strong><span>累计 UV</span></div><div><strong data-total="wau">—</strong><span>最近 7 天 WAU</span></div></div>
    <details class="telemetry-details"><summary>查看最近 10 天 PV / UV 趋势</summary><iframe data-src="${url(dashboard)}" loading="lazy" title="访问统计趋势" referrerpolicy="no-referrer"></iframe></details>
  </div>`;
}

/** 08 实时访问统计 + 可选的精选评论 + 知识币横幅 */
export function community(P) {
  const C = P.community;
  const counters = (C.counters || []).map(([l, n]) => `<div class="counter"><div class="n" data-n="${+n}">0</div><div class="l">${esc(l)}</div></div>`).join('');
  const one = (C.comments || []).map(([n, t]) => `<span><b>@${esc(n)}</b>${esc(t)}</span>`).join('');
  /** 没有配置原文档地址时（公开版），横幅不加链接 */
  const doc = P.meta.docUrl ? url(P.meta.docUrl) : '';
  return `<section id="rep">${head('08', C.title, C.sub)}
    ${telemetry(C.telemetry)}
    ${counters ? `<div class="counters reveal">${counters}</div>` : ''}
    ${one ? `<div class="ticker reveal" aria-label="评论精选"><div class="track">${one}${one}</div></div>` : ''}
    ${C.coinBanner ? `<div class="coin reveal"><img src="${url(C.coinBanner)}" alt="送个知识币再走吧" loading="lazy">${doc ? `<a class="btn" href="${doc}" target="_blank" rel="noopener">${esc(C.coinButton)}</a>` : ''}</div>` : ''}</section>`;
}

/** 页脚 */
export function footer(P) {
  return `<footer>${P.footer.map((l, i) => `<p${i ? ' style="margin-top:8px"' : ''}>${rich(l)}</p>`).join('')}</footer>`;
}
