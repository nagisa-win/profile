/** 页面交互脚本：开机动画、数字雨、HUD 时钟、打字机、显现动画、破解按钮、脑图、计数器、评论跑马灯 */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** 构建时注入的页面数据（打字机词条、脑图） */
  const DATA = JSON.parse(($('#profile-data') || { textContent: '{}' }).textContent);

  /** 开机引导：逐行输出日志并推进进度条，点击可跳过 */
  function boot() {
    const el = $('#boot');
    const log = $('#bootlog');
    const bar = $('#bootbar');
    const lines = [
      '> ARASAKA BIOS v20.77 ........ OK',
      '> MOUNTING /dev/nagisa ....... OK',
      '> LOADING FE.MAGIC @ 100°C ... OK',
      '> SYNCING KU://个人说明书 ..... OK',
      '> ICE BYPASS ................. GRANTED',
      '> WAKE UP, SAMURAI. WE HAVE A CITY TO BURN.',
    ];
    let i = 0;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      el.classList.add('done');
      document.body.dispatchEvent(new Event('booted'));
    };
    el.addEventListener('click', close);
    if (reduced || sessionStorage.getItem('nagisa-booted')) return close();
    sessionStorage.setItem('nagisa-booted', '1');
    const step = () => {
      if (closed) return;
      if (i < lines.length) {
        log.textContent += lines[i] + '\n';
        bar.style.width = ((i + 1) / lines.length) * 100 + '%';
        i++;
        setTimeout(step, 260);
      } else {
        setTimeout(close, 500);
      }
    };
    step();
  }

  /** 数字雨背景：片假名 + 十六进制字符 */
  function rain() {
    const cv = $('#rain');
    const ctx = cv.getContext('2d');
    const chars = 'アカサタナハマヤラワ0123456789ABCDEF渚NAGISA'.split('');
    const size = 16;
    let cols = [];
    const resize = () => {
      cv.width = innerWidth;
      cv.height = innerHeight;
      cols = Array(Math.ceil(cv.width / size)).fill(0).map(() => Math.random() * -50);
    };
    resize();
    addEventListener('resize', resize);
    if (reduced) return;
    const draw = () => {
      ctx.fillStyle = 'rgba(7,7,12,0.12)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.font = size + 'px monospace';
      cols.forEach((y, x) => {
        const ch = chars[(Math.random() * chars.length) | 0];
        /** 少量字符用黄色高亮，其余用青色 */
        ctx.fillStyle = Math.random() > 0.975 ? '#fcee0a' : 'rgba(2,215,242,0.7)';
        ctx.fillText(ch, x * size, y * size);
        cols[x] = y * size > cv.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    };
    setInterval(draw, 55);
  }

  /** HUD 时钟 + 午休状态检测 */
  function clock() {
    const c = $('#clock');
    const nap = $('#napState');
    const box = nap && nap.closest('[data-nap-start]');
    const from = box ? +box.dataset.napStart : 12;
    const to = box ? +box.dataset.napEnd : 14;
    const tick = () => {
      const d = new Date();
      c.textContent = d.toTimeString().slice(0, 8);
      const h = d.getHours();
      /** 落在午休时段内视为休息 */
      if (nap) nap.innerHTML = h >= from && h < to
        ? '&gt; <span style="color:var(--r)">STATUS: SLEEPING 💤 当前处于午休时段</span>'
        : '&gt; <span style="color:var(--g)">STATUS: ONLINE ● 当前大概率在线</span>';
    };
    tick();
    setInterval(tick, 1000);
  }

  /** 打字机：循环输出标签 */
  function typer() {
    const el = $('#typed');
    const words = DATA.typed || [];
    if (!el || !words.length) return;
    let w = 0;
    let n = 0;
    let del = false;
    const run = () => {
      const s = words[w];
      n += del ? -1 : 1;
      el.textContent = s.slice(0, n);
      let t = del ? 40 : 90;
      if (!del && n === s.length) { del = true; t = 1600; }
      else if (del && n === 0) { del = false; w = (w + 1) % words.length; t = 300; }
      setTimeout(run, t);
    };
    run();
  }

  /** 进入视口时显现，并触发进度条与计数器 */
  function reveal() {
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('.fill', e.target).forEach((f) => { f.style.width = f.dataset.w + '%'; });
        $$('.n[data-n]', e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((el) => io.observe(el));
  }

  /** 数字滚动到目标值 */
  function countUp(el) {
    const target = +el.dataset.n;
    const t0 = performance.now();
    const dur = 1600;
    const f = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  /** 破解按钮：连点 10 次随机揭示一条，再点一次重置（还原原文档随心搭逻辑） */
  function breach() {
    $$('.breach').forEach((box) => {
      const facts = JSON.parse(box.dataset.facts);
      const btn = $('button', box);
      const prog = $('.prog', box);
      const label = btn.textContent;
      const need = 10;
      let cnt = 0;
      let solved = false;
      prog.innerHTML = '<i></i>'.repeat(need);
      const paint = () => $$('i', prog).forEach((b, k) => b.classList.toggle('on', k < cnt));
      btn.addEventListener('click', () => {
        if (solved) {
          solved = false;
          cnt = 0;
          btn.classList.remove('solved');
          btn.textContent = label;
          return paint();
        }
        cnt++;
        btn.classList.remove('shake');
        void btn.offsetWidth;
        btn.classList.add('shake');
        paint();
        if (cnt >= need) {
          solved = true;
          btn.classList.add('solved');
          btn.textContent = '[DECRYPTED] ' + facts[(Math.random() * facts.length) | 0];
        } else {
          btn.textContent = `${label} · ${need - cnt}`;
        }
      });
    });
  }

  /** 精神状态脑图（来自原文档思维导图），桌面端绘制为神经链路，移动端退化为列表 */
  function neuro() {
    const N = DATA.neuro;
    const map = $('#neuroMap');
    if (!N || !map) return;
    /** 配置里的 branches 转为绘制用的树 */
    const tree = { t: N.root, c: N.branches.map((b) => ({ t: b.text, alt: b.alt, c: b.children })) };
    const svgNS = 'http://www.w3.org/2000/svg';
    const draw = () => {
      map.innerHTML = '';
      const W = map.clientWidth;
      const H = map.clientHeight;
      const svg = document.createElementNS(svgNS, 'svg');
      map.appendChild(svg);
      const node = (txt, x, y, cls) => {
        const d = document.createElement('div');
        d.className = 'node ' + cls;
        d.textContent = txt;
        d.style.left = x + 'px';
        d.style.top = y + 'px';
        map.appendChild(d);
      };
      const link = (x1, y1, x2, y2, alt) => {
        const p = document.createElementNS(svgNS, 'path');
        const mx = (x1 + x2) / 2;
        p.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
        if (alt) p.setAttribute('class', 'alt');
        svg.appendChild(p);
      };
      const rx = W * 0.08;
      const ry = H / 2;
      const x1 = W * 0.36;
      const x2 = W * 0.72;
      node(tree.t, rx, ry, 'root');
      const total = tree.c.reduce((s, b) => s + b.c.length, 0);
      let k = 0;
      tree.c.forEach((b) => {
        const ys = b.c.map(() => (H / (total + 1)) * ++k);
        const by = (ys[0] + ys[ys.length - 1]) / 2;
        link(rx + 30, ry, x1 - 90, by, b.alt);
        node(b.t, x1, by, 'l1' + (b.alt ? ' alt' : ''));
        b.c.forEach((t, j) => {
          link(x1 + 90, by, x2 - 100, ys[j], b.alt);
          node(t, x2, ys[j], 'l2' + (b.alt ? ' alt' : ''));
        });
      });
    };
    draw();
    addEventListener('resize', draw);
  }

  /** 自定义光标 + 身份卡 3D 倾斜 */
  function pointer() {
    const cur = $('#cursor');
    const card = $('#idcard');
    addEventListener('mousemove', (e) => {
      cur.style.left = e.clientX + 'px';
      cur.style.top = e.clientY + 'px';
      cur.classList.toggle('hot', !!e.target.closest('a,button'));
    });
    if (reduced || !card) return;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  }

  /** 实时访问统计：内网使用 POPO 用户，公开版使用浏览器特征哈希 */
  function telemetry() {
    const box = $('#telemetry');
    if (!box) return;
    const state = $('[data-telemetry-status]', box);
    const service = box.dataset.service.replace(/\/$/, '');
    const docId = box.dataset.docId;
    const mode = box.dataset.userMode;
    /** 发布使用默认 Web 端口，本地预览使用自定义端口 */
    const preview = location.protocol === 'file:' || Boolean(location.port);
    const setStatus = (text, error = false) => {
      state.textContent = text;
      state.classList.toggle('error', error);
    };
    /** 适配两套运行环境的用户信息，返回值沿用原统计服务的字段结构 */
    const getVisitor = async () => {
      if (mode === 'popo') {
        const me = await window.PopSDK.user.info();
        return { name: me.userName, nickname: me.nickname, avatar: me.avatar };
      }
      /** 原始特征只在当前页面使用，网站 Salt 避免与其他页面的统计记录串联 */
      const traits = [
        navigator.userAgent, navigator.platform, navigator.language,
        (navigator.languages || []).join(','), Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen.width, screen.height, screen.colorDepth, devicePixelRatio,
        navigator.hardwareConcurrency, navigator.deviceMemory, navigator.maxTouchPoints,
      ];
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${docId}|${traits.join('|')}`));
      const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
      return { name: `fp_${hash}`, nickname: '设备访客' };
    };
    const report = async () => {
      const res = await fetch(`${service}/doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ docName: box.dataset.docName, docId, docType: 'html', ts: Date.now(), user: await getVisitor() }),
      });
      const result = await res.json();
      if (!res.ok || Number(result.code) !== 0) throw new Error('report failed');
    };
    const load = async () => {
      if (preview) {
        setStatus('PREVIEW · 本地预览不上报');
      } else {
        try {
          await report();
          setStatus(mode === 'popo' ? 'LIVE · POPO 访客已计数' : 'LIVE · 设备哈希已计数');
        } catch (e) {
          console.warn('访问记录上报失败', e);
          setStatus('OFFLINE · 访问量记录失败', true);
        }
      }
      /** 新的公开统计在首次访问前没有记录，404 时如实显示 0 */
      let data = { totalPv: 0, totalUv: 0, wau: 0 };
      const res = await fetch(`${service}/doc-status/${encodeURIComponent(docId)}?format=json`, { credentials: 'omit', referrerPolicy: 'no-referrer' });
      if (res.status === 404) {
        console.info('公开访问统计等待第一批访客');
      } else if (res.ok) {
        data = await res.json();
      } else {
        throw new Error('stats unavailable');
      }
      [['pv', data.totalPv], ['uv', data.totalUv], ['wau', data.wau]].forEach(([key, value]) => {
        $(`[data-total="${key}"]`, box).textContent = Number(value || 0).toLocaleString('zh-CN');
      });
    };
    load().catch((e) => {
      console.warn('访问统计暂不可用', e);
      setStatus('OFFLINE · 统计暂不可用', true);
    });
    const details = $('.telemetry-details', box);
    details.addEventListener('toggle', () => {
      const frame = $('iframe', details);
      /** 展开趋势时才加载原仪表盘，避免首屏请求第三方图表库 */
      if (details.open && !frame.src) frame.src = frame.dataset.src;
    });
  }

  /** 导航高亮当前区块 */
  function navSpy() {
    const links = $$('.hud nav a');
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.hash === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((a) => { const s = $(a.hash); if (s) io.observe(s); });
  }

  boot();
  rain();
  clock();
  typer();
  reveal();
  breach();
  neuro();
  telemetry();
  pointer();
  navSpy();
})();
