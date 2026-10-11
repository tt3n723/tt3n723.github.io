// Mermaid 图表的懒加载渲染。
//
// 三条设计约束：
//   1. mermaid 有 1MB 左右，**不能**打进主 bundle —— 用动态 import()
//   2. 只有页面里真有 \`\`\`mermaid 代码块时才加载
//   3. 而且要滚动到眼前才渲染
// 主题切换时用 theme-set 事件（src/scripts/theme.ts 派发）重新渲染。
export function initMermaid() {
const blocks = Array.from(
  document.querySelectorAll<HTMLPreElement>('pre.astro-code[data-language="mermaid"]'),
);

if (blocks.length > 0) {
  const isDark = () => document.documentElement.classList.contains('dark');
  let loader: Promise<typeof import('mermaid').default> | null = null;
  let counter = 0;
  let loaded = false;

  // 原文存起来：渲染成 SVG 之后代码块就没了，但换主题要重渲染
  const sources = new Map<HTMLElement, { host: HTMLElement; source: string }>();

  const load = () => {
    if (!loader) {
      loader = import('mermaid').then((mod) => {
        mod.default.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: isDark() ? 'dark' : 'default',
        });
        return mod.default;
      });
    }
    return loader;
  };

  const paint = async () => {
    const mermaid = await load();
    for (const entry of sources.values()) {
      try {
        const { svg } = await mermaid.render('mermaid-' + (counter += 1), entry.source);
        entry.host.innerHTML = svg;
        entry.host.classList.remove('is-error');
      } catch (error) {
        entry.host.innerHTML = '';
        entry.host.classList.add('is-error');
        const message = document.createElement('p');
        message.className = 'mermaid-error';
        message.textContent =
          'Mermaid 渲染失败：' + (error instanceof Error ? error.message : String(error));
        const code = document.createElement('pre');
        code.className = 'mermaid-source';
        code.textContent = entry.source;
        entry.host.append(message, code);
      }
    }
  };

  const collect = () => {
    for (const block of blocks) {
      const source = block.querySelector('code')?.textContent ?? '';
      if (!source.trim()) continue;
      const wrapper = block.closest<HTMLElement>('.code-block') ?? block;
      const host = document.createElement('div');
      host.className = 'mermaid-block';
      wrapper.replaceWith(host);
      sources.set(host, { host, source });
    }
  };

  const start = async () => {
    if (loaded) return;
    loaded = true;
    collect();
    await paint();
  };

  // 滚动到图表附近才动手
  const observer = new IntersectionObserver(
    (entries, self) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        self.disconnect();
        void start();
      }
    },
    { rootMargin: '200px' },
  );
  observer.observe(blocks[0]);

  // 主题变了就重渲染（mermaid 的主题在 initialize 时定死）
  document.addEventListener('theme-set', () => {
    if (!loaded) return;
    void load().then(async (mermaid) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: isDark() ? 'dark' : 'default',
      });
      await paint();
    });
  });
}
}
