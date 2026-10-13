// 明暗切换：**点一下就换**，不做三态菜单，也不跟随系统（作者要求）。
//
// 首屏的初始状态由 BaseLayout 里的内联脚本设好（防白屏闪烁），
// 这里只处理点击。每次变更派发 theme-set 事件，让 Mermaid 之类的重画。
const STORAGE_KEY = 'theme';

export function applyTheme(mode: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  document.dispatchEvent(new CustomEvent('theme-set', { detail: { dark: mode === 'dark' } }));
}

export function initTheme() {
  // ⚠️ 每次 page-load 都要**重新套用一次**主题。
  //    ClientRouter 切页时会用新页面的 <html> 属性覆盖当前值，而 `dark` 类是
  //    客户端加上去的、服务端渲染里没有 —— 于是被抹掉；而设置它的那个内联脚本
  //    在切页时**不会重跑**。结果就是：暗色模式下翻一页就变回浅色
  //    （localStorage 里还写着 dark，但 <html> 上的类没了）。
  //    这和 boot() 里补 `js` 类是同一个坑。
  const stored = localStorage.getItem(STORAGE_KEY) ?? 'auto';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle(
    'dark',
    stored === 'dark' || (stored === 'auto' && prefersDark),
  );

  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((button) => {
    if (button.dataset.ready === 'true') return;
    button.dataset.ready = 'true';
    button.addEventListener('click', () => {
      const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  });
}
