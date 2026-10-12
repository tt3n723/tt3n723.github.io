// 樱花特效 —— 飘落的花瓣。
//
// 实现照搬 Firefly：**Dedicated Worker + OffscreenCanvas**，绘制完全脱离主线程，
// 所以 ClientRouter 切页时不会因为主线程忙而掉帧。
// 花瓣图是 /assets/images/effects/sakura.png（也在 worker 里 fetch）。
//
// ⚠️ 一个必须记住的坑（原来的烟花特效就死在这）：
//   canvas 元素在 ClientRouter 切页时会被 body swap 移除，
//   而 OffscreenCanvas 是绑定在那个元素上的 —— 元素一掉，画什么都看不见。
//   所以每次 astro:page-load 都要检查 canvas 还在不在文档里，不在就挂回去。
import { sakuraConfig } from '../config-sakura';
import type { SakuraConfig, SakuraWorkerOutboundMessage } from '../types/sakura';

const CANVAS_ID = 'canvas_sakura';

class SakuraManager {
  private canvas: HTMLCanvasElement | null = null;
  private worker: Worker | null = null;
  private isRunning = false;
  private boundResize: (() => void) | null = null;
  private boundVisibility: (() => void) | null = null;
  private resizeRafId: number | null = null;
  private workerReady = false;

  constructor(private config: SakuraConfig) {}

  async init() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.workerReady = false;
    try {
      const canvas = document.createElement('canvas');
      canvas.id = CANVAS_ID;
      canvas.className = 'sakura-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(canvas);
      this.canvas = canvas;

      // 转移控制权后主线程不能再拿它的 2d context
      const offscreen = canvas.transferControlToOffscreen();
      this.worker = new Worker(new URL('../workers/sakura.worker.ts', import.meta.url), { type: 'module' });

      this.worker.onerror = (e) => {
        console.warn('[sakura] worker error:', e.message);
        if (!this.workerReady) this.stop();
      };
      this.worker.onmessage = (e: MessageEvent<SakuraWorkerOutboundMessage>) => {
        const data = e.data;
        if (data.type === 'ready') this.workerReady = true;
        else if (data.type === 'error') {
          console.warn('[sakura]', data.message);
          if (!this.workerReady) this.stop();
        } else if (data.type === 'messageError') console.warn('[sakura]', data.message);
      };

      this.worker.postMessage(
        { type: 'init', config: this.config, canvas: offscreen, width: window.innerWidth, height: window.innerHeight },
        [offscreen],
      );

      this.boundResize = () => {
        if (this.resizeRafId !== null) return;
        this.resizeRafId = requestAnimationFrame(() => {
          this.resizeRafId = null;
          this.worker?.postMessage({ type: 'resize', width: window.innerWidth, height: window.innerHeight });
        });
      };
      window.addEventListener('resize', this.boundResize);

      this.boundVisibility = () => {
        this.worker?.postMessage({ type: 'visibilitychange', hidden: document.hidden });
      };
      document.addEventListener('visibilitychange', this.boundVisibility);
    } catch (err) {
      console.warn('[sakura] init failed:', err);
      this.stop();
    }
  }

  /** 切页之后 canvas 可能已被 body swap 摘掉，挂回去即可（worker 和 OffscreenCanvas 都还在） */
  reattach() {
    if (this.canvas && !this.canvas.isConnected) document.body.appendChild(this.canvas);
  }

  stop() {
    if (this.resizeRafId !== null) { cancelAnimationFrame(this.resizeRafId); this.resizeRafId = null; }
    if (this.worker) {
      this.worker.postMessage({ type: 'stop' });
      this.worker.terminate(); // terminate 会立即回收 worker 堆（含 ImageBitmap）
      this.worker = null;
    }
    if (this.boundResize) { window.removeEventListener('resize', this.boundResize); this.boundResize = null; }
    if (this.boundVisibility) { document.removeEventListener('visibilitychange', this.boundVisibility); this.boundVisibility = null; }
    if (this.canvas) { this.canvas.remove(); this.canvas = null; }
    this.workerReady = false;
    this.isRunning = false;
  }

  getIsRunning() { return this.isRunning; }
}

let manager: SakuraManager | null = null;
let reduced = false;

export function initSakura() {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const disabled = document.documentElement.classList.contains('sakura-off');

  if (reduced || disabled || !sakuraConfig.enable) {
    manager?.stop();
    manager = null;
    return;
  }

  if (manager?.getIsRunning()) {
    manager.reattach(); // 切页后把 canvas 挂回来
    return;
  }

  manager = new SakuraManager(sakuraConfig);
  void manager.init();
}

export function stopSakura() {
  manager?.stop();
  manager = null;
}

// 设置面板里开关樱花时立即生效（不刷新页面）
if (typeof window !== 'undefined') {
  window.addEventListener('sakura:change', () => initSakura());
}
