/**
 * 预加载（带优先级）。
 *
 * ── 为什么不用 <ClientRouter prefetch> ──
 * Astro 的预加载不暴露 fetch 优先级，没法表达作者要的：
 *   「后台慢慢下，但我要点的那一篇优先」
 *
 * ── 这里怎么做 ──
 *   1. 当前页 load 完、浏览器空闲之后，用 priority: 'low' 把同源链接一个个预取
 *      → 低优先级意味着它不会跟当前页正在用的资源抢带宽
 *   2. 鼠标移上去 / 按下去时，用 priority: 'high' 把那一篇提到队首
 *      → 如果它正以 low 在下，**取消重下**：已经在飞的请求改不了优先级
 *
 * ── 为什么要带 Accept: text/html ──
 * Service Worker 判断"这是一个页面请求"看的就是这个头。
 * 不带的话预取的内容进不了 SW 的缓存，点击时还得再走一次网络。
 */

type Priority = 'low' | 'high';

const done = new Set<string>();
const inflight = new Map<string, { controller: AbortController; low: boolean }>();
let booted = false;

function sameOriginLinks(): HTMLAnchorElement[] {
  return [...document.querySelectorAll<HTMLAnchorElement>('a[href]')].filter((a) => {
    if (a.dataset.noPrefetch !== undefined) return false;
    if (a.hash && a.pathname === location.pathname) return false;
    return a.origin === location.origin;
  });
}

function prefetch(url: string, priority: Priority) {
  if (done.has(url)) return;

  const running = inflight.get(url);
  if (running) {
    // 已经在下了：只有「低优先级 → 高优先级」需要处理（取消重下）
    if (priority === 'high' && running.low) {
      running.controller.abort();
      inflight.delete(url);
    } else {
      return;
    }
  }

  const controller = new AbortController();
  inflight.set(url, { controller, low: priority === 'low' });
  fetch(url, {
    priority,
    signal: controller.signal,
    headers: { Accept: 'text/html' },
  } as RequestInit)
    .then((res) => {
      if (res.ok) done.add(url);
    })
    .catch(() => undefined)
    .finally(() => {
      const cur = inflight.get(url);
      if (cur && cur.controller === controller) inflight.delete(url);
    });
}

export function initPrefetch() {
  // 一个页面生命周期只启动一次后台预取
  if (!booted) {
    booted = true;
    const startBackground = () => {
      requestIdleCallback(
        () => {
          for (const a of sameOriginLinks()) prefetch(a.href, 'low');
        },
        { timeout: 3000 },
      );
    };
    if (document.readyState === 'complete') startBackground();
    else window.addEventListener('load', startBackground, { once: true });

    // 悬停/按下：把目标提到高优先级（事件委托，只挂一次）
    const bump = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const a = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.origin !== location.origin) return;
      prefetch(a.href, 'high');
    };
    document.addEventListener('mouseover', bump, { passive: true });
    document.addEventListener('mousedown', bump, { passive: true });
    document.addEventListener('touchstart', bump, { passive: true });
  }
}
