// 标签页（:::tabs / ::tab）：把静态标记变成可点的 tab。
// 纯原生 JS，约 15 行。没有它时也能用——CSS 会显示第一个面板。
export function initTabs() {
document.querySelectorAll<HTMLElement>('.md-tabs').forEach((tabs) => {
  const buttons = Array.from(tabs.querySelectorAll<HTMLButtonElement>('.tab-btn'));
  const panels = Array.from(tabs.querySelectorAll<HTMLElement>('.tab-panel'));
  if (!buttons.length || buttons.length !== panels.length) return;

  // 让 CSS 知道 JS 已经接管，从而启用「只显示选中面板」的规则
  tabs.dataset.tabsReady = 'true';

  const select = (active: number) => {
    buttons.forEach((button, index) => {
      button.setAttribute('aria-selected', String(index === active));
    });
    panels.forEach((panel, index) => {
      panel.classList.toggle('is-active', index === active);
    });
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
  });

  select(0);
});
}
