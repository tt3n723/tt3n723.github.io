// 鼠标点击特效：点页面任意位置放一朵烟花。零依赖，纯 canvas。
//
// ⚠️ 这个特效之前**因为一个 bug 被删掉过**：canvas 只在初始化时取了一次，
//    而 ClientRouter 切页时会替换 body 的子节点，那个 canvas 元素就**脱离文档**了 ——
//    画什么都看不见。症状是：首次加载有效，切过一次页之后永久失效。
//    修法和樱花一样：每次 astro:page-load 检查 canvas 还在不在文档里，不在就挂回去。
//
// 默认关闭，在设置面板里开。尊重系统的「减少动态效果」。

const CANVAS_ID = 'canvas_fireworks';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
}

export function initFireworks() {
  const disabled = document.documentElement.classList.contains('fireworks-off');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (disabled || reduced) return;

  let canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
  let ctx = canvas?.getContext('2d') ?? null;

  // 切页后 canvas 会被 body swap 摘掉 —— 挂回去继续用（不用重建，画布内容还在）
  if (canvas && !canvas.isConnected) document.body.appendChild(canvas);

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    canvas.className = 'fireworks-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
  }
  if (!canvas || !ctx) return;
  // 已经初始化过就别重复挂监听（切页会反复调用这个函数）
  if (canvas.dataset.ready === 'true') return;
  canvas.dataset.ready = 'true';

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas!.width = width * dpr;
    canvas!.height = height * dpr;
    canvas!.style.width = width + 'px';
    canvas!.style.height = height + 'px';
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const particles: Particle[] = [];
  const palette = ['#4f46e5', '#22d3ee', '#f472b6', '#facc15', '#34d399'];
  let frame = 0;

  const burst = (x: number, y: number) => {
    const color = palette[Math.floor(Math.random() * palette.length)]!;
    for (let i = 0; i < 36; i++) {
      const angle = (Math.PI * 2 * i) / 36 + Math.random() * 0.25;
      const speed = 1.5 + Math.random() * 3.2;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        max: 45 + Math.random() * 25,
        color,
        size: 1.2 + Math.random() * 1.8,
      });
    }
  };

  const loop = () => {
    if (document.documentElement.classList.contains('fireworks-off')) {
      ctx!.clearRect(0, 0, width, height);
      frame = 0;
      return;
    }
    ctx!.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]!;
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.045;
      p.vx *= 0.985;
      p.vy *= 0.985;
      const alpha = Math.max(0, 1 - p.life / p.max);
      if (alpha <= 0) { particles.splice(i, 1); continue; }
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = p.color;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx!.fill();
    }
    ctx!.globalAlpha = 1;
    frame = particles.length ? requestAnimationFrame(loop) : 0;
  };

  document.addEventListener('click', (event) => {
    burst(event.clientX, event.clientY);
    if (!frame) frame = requestAnimationFrame(loop);
  });
}

// 设置面板里开关烟花时立即生效
if (typeof window !== 'undefined') {
  window.addEventListener('fireworks:change', () => {
    const off = document.documentElement.classList.contains('fireworks-off');
    if (!off) initFireworks();
  });
}
