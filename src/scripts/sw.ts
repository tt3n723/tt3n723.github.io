/**
 * Service Worker 的注册与「强制更新」。
 *
 * ── 为什么需要「强制更新」按钮 ──
 * 页面导航用的是**缓存优先**：先用本机副本秒开，同时在后台下载最新一份。
 * 所以刚部署完打开，看到的可能还是上一版。而**普通刷新(F5)会被 SW 拦下、照样给旧副本**，
 * 只有 Ctrl+Shift+R 能绕过。与其记组合键，不如给个按钮：
 *   注销 SW → 删光所有缓存 → 重载 → 这次一定从网络拿。
 */

const SW_URL = '/sw.js';

export function initSw() {
  // 只在生产环境注册 —— 开发时注册会把热更新搞坏
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register(SW_URL, { scope: '/' }).catch(() => undefined);
  }

  // 「强制更新」按钮（ClientRouter 换页后要重新绑）
  document.querySelectorAll<HTMLElement>('[data-cache-reset]').forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      void forceRefresh();
    });
  });

  // 离线页的「重新加载」
  document.querySelectorAll<HTMLElement>('[data-offline-reload]').forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => location.reload());
  });
}

export async function forceRefresh() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // 清不掉也要重载，至少能拿到网络版本
  }
  location.reload();
}
