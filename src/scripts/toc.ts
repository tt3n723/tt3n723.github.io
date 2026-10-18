/**
 * 文章页右侧目录的交互。
 *
 * ── 这一版只做三件事 ──
 *   1. 高亮「正文里正在看的那一段」（只切 class，不读任何位置信息）
 *   2. 自动展开当前所在的一级章节（作者要的行为，保留）
 *   3. 点击条目平滑跳到对应标题
 *
 * ── 上一版为什么卡（作者的实测反馈：目录划不动、一卡一卡）──
 *   1. 每滚动一帧读 62 次 getBoundingClientRect
 *      —— 在 5 万节点的文章页上，读和写交替会让浏览器反复强制重排
 *   2. 写完样式又读位置，读写不分阶段 → 布局抖动
 *   3. **目录自己会滚**（scroller.scrollTo smooth）：正文一动，目录被拽回当前项
 *      —— 这就是「拖不到底」的直接原因
 *   4. .toc-children 用 max-height 动画开合 → 动画期间每帧重新排版
 *   5. .toc-item-l0 是 sticky → 滚动时顶部反复换人，视觉上「啪」一下
 *
 * ── 现在怎么绕开 ──
 *   · 用 IntersectionObserver 盯标题，只在进入/离开时触发，不再每帧计算
 *   · 只 toggle class，一个内联样式都不写 → 指示条交给 CSS ::before 画
 *   · **目录不再自己滚动**，控制权完全交给用户
 *   · 开合不做动画，瞬间切换
 */

export function initToc() {
  const content = document.querySelector<HTMLElement>('[data-toc-content]');
  if (!content) return;

  const items = [...content.querySelectorAll<HTMLAnchorElement>('.toc-item')];
  const groups = [...content.querySelectorAll<HTMLElement>('[data-toc-group]')];
  const headings = [...document.querySelectorAll<HTMLElement>('.prose [id]')].filter((h) =>
    items.some((item) => item.dataset.headingId === h.id),
  );
  if (!items.length || !headings.length) return;

  // 导航栏高度：一页生命周期内不变，只在 resize 时失效
  let headerPx = -1;
  const headerOffset = () => {
    if (headerPx >= 0) return headerPx;
    const header = document.getElementById('site-header');
    headerPx = Math.round(header ? header.getBoundingClientRect().height : 0) + 16;
    return headerPx;
  };

  let currentId = '';
  const setActive = (id: string) => {
    if (id === currentId) return;
    currentId = id;
    let activeItem: HTMLAnchorElement | undefined;
    for (const item of items) {
      const on = item.dataset.headingId === id;
      item.classList.toggle('is-active', on);
      if (on) activeItem = item;
    }
    // 只展开「当前所在的那一章」，其余收起（保留作者原来的设计）
    const group = activeItem?.closest<HTMLElement>('[data-toc-group]') ?? null;
    for (const g of groups) g.classList.toggle('is-current', g === group);
  };

  /*
   * 用一条「顶部 45% 的带」判断当前章节：
   * 标题进入这条带就算可见，取文档顺序里**最后一个**可见的 —— 也就是最靠下的那个，
   * 正是你此刻正在读的那一节。
   *
   * 关键：所有位置信息都来自 observer 的 entry，不再自己调 getBoundingClientRect。
   */
  const visible = new Set<HTMLElement>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
        else visible.delete(entry.target as HTMLElement);
      }
      let active: HTMLElement | undefined;
      for (const heading of headings) if (visible.has(heading)) active = heading;
      if (active) setActive(active.id);
    },
    { rootMargin: '0px 0px -55% 0px', threshold: 0 },
  );
  headings.forEach((heading) => observer.observe(heading));

  // 点击：跳转 + 平滑滚动。用 offsetTop 累加而不是 getBoundingClientRect，避免强制重排
  items.forEach((item) => {
    item.addEventListener('click', (event) => {
      const id = item.dataset.headingId ?? '';
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
      window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', '#' + id);
    });
  });

  window.addEventListener('resize', () => { headerPx = -1; }, { passive: true });
}
