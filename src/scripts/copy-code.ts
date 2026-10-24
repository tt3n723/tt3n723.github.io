// 代码块的运行时行为。
//
// 作者定的规则：
//   1. **全站一个组件**：三色点 +（题解块才有）标题 + 语言 + 复制图标
//   2. **标题栏不显示行数**，也不放三角箭头
//   3. **整条标题栏可点**就展开/收起
//   4. 展开还是收起**只由"默认是否展开"决定**：
//        折叠题解块（:::details）默认收起；普通代码块默认展开
const LINE_NUMBERS_FROM = 3; // 超过这么多行才加行号（一两行的代码加行号很蠢）

const COPY_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
const DONE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>';

function makeIconDots() {
  const dots = document.createElement('span');
  dots.className = 'code-dots';
  dots.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 3; i += 1) dots.append(document.createElement('i'));
  return dots;
}

function makeCopyButton(pre: HTMLPreElement) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'copy-btn';
  button.setAttribute('aria-label', '复制代码');
  button.title = '复制';
  button.innerHTML = COPY_ICON + DONE_ICON;
  button.addEventListener('click', async (event) => {
    event.stopPropagation(); // 别触发标题栏的展开/收起
    const code = pre.querySelector('code')?.textContent ?? '';
    const ok = await navigator.clipboard
      .writeText(code)
      .then(() => true)
      .catch(() => false);
    button.classList.add(ok ? 'is-done' : 'is-failed');
    setTimeout(() => button.classList.remove('is-done', 'is-failed'), 1500);
  });
  return button;
}


/*
 * 长行放不下时把这一块的字号按比例缩小，让它塞进容器 —— 不用折行（会破坏代码形状），
 * 也不用横向滚动条（要拖）。
 *
 * 只量一次就够了：scrollWidth 和字号近似成正比，所以 需要比例 = clientWidth / scrollWidth，
 * 不用循环试缩（那会在 5 万节点的页面上反复强制重排）。
 *
 * 缩到 62% 还放不下就放弃 —— 保持可读比「绝不滚动」重要，剩下的交给 overflow-x: auto。
 */
const MIN_CODE_FIT = 0.62;
function fitLongestLine(pre: HTMLPreElement) {
  // 收起状态下 clientWidth 是 0，量不出东西
  if (!pre.clientWidth) return;
  pre.style.removeProperty('--code-fit');
  const need = pre.scrollWidth - pre.clientWidth;
  if (need <= 1) return;
  const scale = (pre.clientWidth / pre.scrollWidth) * 0.995;
  if (!Number.isFinite(scale) || scale >= 1) return;
  pre.style.setProperty('--code-fit', Math.max(MIN_CODE_FIT, scale).toFixed(3));
}
export function initCopyCode() {
  const blocks = Array.from(document.querySelectorAll<HTMLPreElement>('pre.astro-code'));

  for (const pre of blocks) {
    if (pre.dataset.ready === 'true') continue;
    pre.dataset.ready = 'true';
    if (pre.parentElement?.classList.contains('code-block')) continue;

    const lines = pre.querySelectorAll('.line');
    const lineCount = lines.length;
    const lang = (pre.dataset.language || '').toLowerCase();
    const fold = pre.closest<HTMLElement>('.fold-code');
    const title = fold?.dataset.foldTitle ?? '';

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block is-collapsible';
    pre.parentNode?.insertBefore(wrapper, pre);

    if (lineCount > LINE_NUMBERS_FROM) wrapper.classList.add('with-lines');

    // ---- 标题栏：三色点 +（标题）+ 语言 + 复制 ----
    const head = document.createElement('div');
    head.className = 'code-head';
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');
    head.append(makeIconDots());

    if (title) {
      const titleEl = document.createElement('span');
      titleEl.className = 'code-title';
      titleEl.textContent = title;
      head.append(titleEl);
    }
    if (lang && !['plaintext', 'text', 'txt'].includes(lang)) {
      const langEl = document.createElement('span');
      langEl.className = 'code-lang';
      langEl.textContent = lang;
      head.append(langEl);
    }
    head.append(makeCopyButton(pre));

    // ---- 默认展开与否：只由"配置"决定 ----
    const collapsedByDefault = fold ? fold.dataset.collapsed === 'true' : false;

    const setCollapsed = (collapsed: boolean) => {
      wrapper.classList.toggle('is-collapsed', collapsed);
      head.setAttribute('aria-expanded', String(!collapsed));
      head.title = collapsed ? '点击展开' : '点击收起';
      // 展开后再量：收起时 clientWidth 是 0
      if (!collapsed) requestAnimationFrame(() => fitLongestLine(pre));
    };
    setCollapsed(collapsedByDefault);

    head.addEventListener('click', () => setCollapsed(!wrapper.classList.contains('is-collapsed')));
    head.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setCollapsed(!wrapper.classList.contains('is-collapsed'));
      }
    });

    wrapper.append(head, pre);
    // 默认展开的块：等浏览器排完版再量
    if (!wrapper.classList.contains('is-collapsed')) {
      requestAnimationFrame(() => fitLongestLine(pre));
    }
  }
}
