/** 轻量赛博朋克动效：复用少量 DOM，仅使用 transform / opacity 动画 */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor = document.querySelector('#cursor');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const create = (className) => {
    const el = document.createElement('div');
    el.className = className;
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
  };
  /** 复用一个动画元素，避免高频点击或按键不断堆积节点 */
  const play = (el, frames, duration) => {
    el.getAnimations().forEach((animation) => animation.cancel());
    el.animate(frames, { duration, easing: 'ease-out', fill: 'forwards' });
  };

  /** 鼠标轨迹仅保留六个循环复用的短划线，不再绘制全屏 Canvas */
  const slices = Array.from({ length: 6 }, () => create('mouse-slice'));
  let sliceIndex = 0;
  let lastX = null;
  let lastY = null;
  let lastTime = 0;
  addEventListener('pointermove', (event) => {
    if (!finePointer.matches || event.pointerType !== 'mouse') return;
    const { clientX: x, clientY: y } = event;
    const now = performance.now();
    if (lastX !== null && now - lastTime > 80) {
      const distance = Math.hypot(x - lastX, y - lastY);
      if (distance > 20) {
        const slice = slices[sliceIndex++ % slices.length];
        const angle = Math.atan2(y - lastY, x - lastX);
        const transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}rad) scaleX(${Math.min(distance / 42, 2.2)})`;
        slice.style.transform = transform;
        play(slice, [
          { opacity: 0.7, transform },
          { opacity: 0, transform: `${transform} translateX(14px)` },
        ], 220);
        lastTime = now;
      }
    }
    lastX = x;
    lastY = y;
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { lastX = lastY = null; });

  /** 点击仅扩散一个细线瞄准环；光标保留原有按压反馈 */
  const impact = create('fx-impact');
  let cursorTimer;
  addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    impact.style.left = `${event.clientX}px`;
    impact.style.top = `${event.clientY}px`;
    play(impact, [
      { opacity: 0.9, transform: 'translate(-50%, -50%) rotate(45deg) scale(0.35)' },
      { opacity: 0, transform: 'translate(-50%, -50%) rotate(135deg) scale(2.3)' },
    ], 320);
    if (cursor) {
      cursor.classList.remove('firing');
      void cursor.offsetWidth;
      cursor.classList.add('firing');
      clearTimeout(cursorTimer);
      cursorTimer = setTimeout(() => cursor.classList.remove('firing'), 200);
    }
  }, { passive: true });

  /** 键盘响应固定在一个 HUD 标签和视口细边框，不再抖动、闪烁整个页面 */
  const echo = create('key-echo');
  const edge = create('fx-edge');
  let inputCount = 0;
  addEventListener('keydown', (event) => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    const names = {
      ' ': 'SPACE', Enter: 'ENTER', Backspace: 'BACKSPACE', Tab: 'TAB', Escape: 'ESC',
      ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓',
    };
    const key = (names[event.key] || event.key).slice(0, 10).toUpperCase();
    inputCount = (inputCount + 1) % 4096;
    echo.textContent = `INPUT // ${key} · ${inputCount.toString(16).padStart(3, '0').toUpperCase()}`;
    play(echo, [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 1, transform: 'translateY(-3px)', offset: 0.65 },
      { opacity: 0, transform: 'translateY(-8px)' },
    ], 650);
    play(edge, [{ opacity: 0.8 }, { opacity: 0 }], 260);
  }, { passive: true });
})();
