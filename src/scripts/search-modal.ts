// 搜索模态框（照旧站 Hexo Fluid 的 local-search 形态）。
//
// 坑（第一版搜索"一直用不了"就是踩了这个）：
//   客户端路由（ClientRouter）下 DOMContentLoaded 不会再触发、
//   <script src> 也不会重新执行 —— 所以脚本要动态 import，初始化挂在 astro:page-load。
const DEBOUNCE = 140;

let pagefind: any = null;

// ⚠️ 这里**不能**写成 import('/pagefind/pagefind.js') 字面量。
// pagefind.js 只存在于构建产物 dist/pagefind/ 里，dev 阶段没有这个文件，
// 而 Vite 在 **dev 和 build 都会**对 import() 的字面量做静态解析 ——
// 结果 pnpm dev 直接报：Failed to resolve import "/pagefind/pagefind.js"。
// （只用 @vite-ignore 注释不够稳，所以这里再把路径拼出来，让静态分析看不到字面量。）
function pagefindUrl() {
  return '/pagefind' + '/pagefind.js';
}

async function loadPagefind() {
  if (pagefind) return pagefind;
  pagefind = await import(/* @vite-ignore */ pagefindUrl());
  return pagefind;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
}

export function initSearchModal() {
  const modal = document.querySelector<HTMLElement>('[data-search-modal]');
  const input = document.querySelector<HTMLInputElement>('[data-search-input]');
  const results = document.querySelector<HTMLElement>('[data-search-results]');
  const hint = document.querySelector<HTMLElement>('[data-search-hint]');
  if (!modal || !input || !results || !hint) return;

  const open = () => {
    modal.hidden = false;
    document.body.classList.add('search-open');
    input.focus();
    input.select();
    void loadPagefind().catch(() => {});
  };
  const close = () => {
    modal.hidden = true;
    document.body.classList.remove('search-open');
  };

  if (modal.dataset.ready !== 'true') {
    modal.dataset.ready = 'true';

    modal.querySelectorAll('[data-search-close]').forEach((el) => el.addEventListener('click', close));

    document.addEventListener('keydown', (event) => {
      if (!modal.hidden && event.key === 'Escape') close();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (modal.hidden) open();
        else close();
      }
    });

    let timer = 0;
    const render = async () => {
      const query = input.value.trim();
      if (!query) {
        results.innerHTML = '';
        hint.hidden = false;
        hint.textContent = '输入关键词开始搜索';
        return;
      }
      hint.hidden = false;
      hint.textContent = '搜索中…';
      try {
        const pf = await loadPagefind();
        const search = await pf.search(query);
        const items = await Promise.all(
          (search.results ?? []).slice(0, 12).map((r: any) => r.data()),
        );
        if (items.length === 0) {
          results.innerHTML = '';
          hint.textContent = '没有找到「' + query + '」相关的内容';
          return;
        }
        hint.hidden = true;
        results.innerHTML = items
          .map((d: any) => {
            const title = d.meta?.title ?? d.url;
            return (
              '<a class="search-item" href="' + d.url + '">' +
              '<span class="search-item-title">' + escapeHtml(String(title)) + '</span>' +
              '<span class="search-item-excerpt">' + (d.excerpt ?? '') + '</span>' +
              '</a>'
            );
          })
          .join('');
      } catch {
        results.innerHTML = '';
        hint.textContent = '搜索索引还没生成 —— 先跑一次 pnpm build 再来。';
      }
    };

    input.addEventListener('input', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(render, DEBOUNCE);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const first = results.querySelector<HTMLAnchorElement>('a.search-item');
        if (first) first.click();
      }
    });
  }

  // 每次页面渲染都重新绑一次（导航栏按钮会被替换）
  document.querySelectorAll<HTMLElement>('[data-search-open]').forEach((button) => {
    if (button.dataset.searchBound === 'true') return;
    button.dataset.searchBound = 'true';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      open();
    });
  });
}
