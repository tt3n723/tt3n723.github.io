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
