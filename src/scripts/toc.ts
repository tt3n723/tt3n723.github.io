/**
 * 文章页目录的交互（抽屉版）。
 *
 * ── 目录现在不在文档流里 ──
 * 以前是浮在正文右侧的常驻侧栏：窄屏会溢出产生横向滚动条，正文还得让出一栏宽度。
 * 现在改成按需抽屉：右下角一个按钮 → 点开右侧滑入。正文因此能撑满全宽。
 *
 * ── 这个文件只做四件事 ──
 *   1. 抽屉开关（按钮 / 遮罩 / Esc / 点条目后自动关）
 *   2. 按钮出现时机（滚过 0.8 屏，和「回到顶部」一致）
 *   3. 高亮并展开「正文里正在读的那一节」（只切 class，不读位置）
 *   4. 点击条目平滑跳到对应标题
 *
 * ── 为什么所有监听器都要加守卫 ──
 * initToc 在每次 astro:page-load（客户端路由）时都会被调用，旧的监听器从不清理。
 * 导航 N 次后 window 上挂着 N 套 resize 监听、N 个 IntersectionObserver 观察已不存在的旧标题。
 * 用 __tocBound / prevObserver 保证全局只留一套。
 */

// 上一次的 observer：路由切换后旧标题已从 DOM 移除，需要 disconnect
let prevObserver: IntersectionObserver | null = null;
// 导航栏高度缓存：模块级，所有 initToc 共享，resize 时失效
let headerPx = -1;

export function initToc() {
  const content = document.querySelector<HTMLElement>('[data-toc-content]');
  const drawer = document.querySelector<HTMLElement>('[data-toc-drawer]');
  const scrim = document.querySelector<HTMLElement>('[data-toc-scrim]');
  const trigger = document.querySelector<HTMLElement>('[data-toc-trigger]');

  // ---- 目录条目数据（先准备好，抽屉逻辑要用到 setActive）----
  const items = content ? [...content.querySelectorAll<HTMLAnchorElement>('.toc-item')] : [];
  const groups = content ? [...content.querySelectorAll<HTMLElement>('[data-toc-group]')] : [];
  const headings = [...document.querySelectorAll<HTMLElement>('.prose [id]')].filter((h) =>
    items.some((item) => item.dataset.headingId === h.id),
  );

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
    // 只展开「当前所在的那一章」
    const group = activeItem?.closest<HTMLElement>('[data-toc-group]') ?? null;
    for (const g of groups) g.classList.toggle('is-current', g === group);
  };

  // ---- 抽屉开关 ----
  const closeDrawer = () => {
    if (drawer) drawer.hidden = true;
    if (scrim) scrim.hidden = true;
    document.body.classList.remove('toc-drawer-open');
  };

  if (trigger && drawer && scrim) {
    if (trigger.dataset.ready !== 'true') {
      trigger.dataset.ready = 'true';

      // 目录按钮和回到顶部按钮出现时机一致：滚过 0.8 屏才出现
      let scrollTicking = false;
      const updateTriggerVisibility = () => {
        scrollTicking = false;
        const t = document.querySelector<HTMLElement>('[data-toc-trigger]');
        if (t) t.hidden = window.scrollY < window.innerHeight * 0.8;
      };
      window.addEventListener(
        'scroll',
        () => {
          if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(updateTriggerVisibility);
          }
        },
        { passive: true },
      );
      requestAnimationFrame(updateTriggerVisibility);

      const openDrawer = () => {
        const d = document.querySelector<HTMLElement>('[data-toc-drawer]');
        const s = document.querySelector<HTMLElement>('[data-toc-scrim]');
        if (!d || !s) return;
        d.hidden = false;
        s.hidden = false;
        document.body.classList.add('toc-drawer-open');
        // 打开时立即高亮当前所在章节（observer 可能还没触发）
        const visibleHeadings = headings.filter((h) => {
          const rect = h.getBoundingClientRect();
          return rect.top >= 0 && rect.top < window.innerHeight * 0.45;
        });
        if (visibleHeadings.length > 0) setActive(visibleHeadings[visibleHeadings.length - 1]!.id);
      };

      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const d = document.querySelector<HTMLElement>('[data-toc-drawer]');
        if (d?.hidden) openDrawer();
        else closeDrawer();
      });
      scrim.addEventListener('click', closeDrawer);
      drawer.querySelector('[data-toc-close]')?.addEventListener('click', closeDrawer);

      // Esc 关闭（全局只挂一次）
      const w = window as unknown as { __tocEscBound?: boolean };
      if (!w.__tocEscBound) {
        w.__tocEscBound = true;
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && !document.querySelector<HTMLElement>('[data-toc-drawer]')?.hidden) {
            closeDrawer();
          }
        });
      }
    }
  }

  if (!content || !items.length || !headings.length) return;

  /*
   * 用一条「顶部 45% 的带」判断当前章节：
   * 标题进入这条带就算可见，取文档顺序里最后一个可见的 —— 正是此刻正在读的那一节。
   * 关键：位置信息全部来自 observer 的 entry，不再自己调 getBoundingClientRect。
   */
  const visible = new Set<HTMLElement>();
  // 先断开上一次的 observer：路由切换后旧标题已不在 DOM 中
  prevObserver?.disconnect();
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
  prevObserver = observer;
  headings.forEach((heading) => observer.observe(heading));

  // 点击：跳转 + 平滑滚动 + 关闭抽屉
  items.forEach((item) => {
    item.addEventListener('click', (event) => {
      const id = item.dataset.headingId ?? '';
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
      window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', '#' + id);
      const d = document.querySelector<HTMLElement>('[data-toc-drawer]');
      if (d && !d.hidden) closeDrawer();
    });
  });

  // resize 监听只挂一次（headerPx 是模块级变量，所有 initToc 共享）
  const w2 = window as unknown as { __tocBound?: boolean };
  if (!w2.__tocBound) {
    w2.__tocBound = true;
    window.addEventListener('resize', () => { headerPx = -1; }, { passive: true });
  }
}
