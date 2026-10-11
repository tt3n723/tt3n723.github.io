// 轻量烟花特效：点击页面任意位置放一朵。零依赖，纯 canvas。
// 尊重系统的「减少动态效果」设置。
export function initFireworks() {
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('fireworks') as HTMLCanvasElement | null;

if (!reduced && canvas) {
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

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

    const particles: Particle[] = [];
    const palette = ['#4f46e5', '#22d3ee', '#f472b6', '#facc15', '#34d399'];
    let frame = 0;

    function burst(x: number, y: number) {
      const color = palette[Math.floor(Math.random() * palette.length)]!;
      const count = 36;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.25;
        const speed = 1.5 + Math.random() * 3.2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          max: 45 + Math.random() * 25,
          color,
          size: 1.2 + Math.random() * 1.8,
        });
      }
    }

    function loop() {
      // 设置面板里可以关掉烟花
      if (document.documentElement.classList.contains('fireworks-off')) {
        ctx!.clearRect(0, 0, width, height);
        requestAnimationFrame(loop);
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
        if (alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      frame = particles.length ? requestAnimationFrame(loop) : 0;
    }

    document.addEventListener('click', (event) => {
      burst(event.clientX, event.clientY);
      if (!frame) frame = requestAnimationFrame(loop);
    });
  }
}
}
