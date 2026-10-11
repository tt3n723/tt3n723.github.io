/**
 * remark-directives —— 用 markdown 指令语法写提示框 / 折叠块 / 标签页 / 链接卡 / 栅格。
 *
 * 为什么用指令而不是 MDX 组件：
 *   指令语法在普通 .md 里就能用，**不需要在每篇文章顶部 import**，
 *   所以已有的 19 篇 .md 永远不会被迫改成 .mdx。
 *
 * 支持的语法（全部实测过，见 src/content/blog/style-guide.md）：
 *
 *   :::tip[标题]            提示框，类型见 CALLOUT_TYPES
 *   内容（正常 markdown）
 *   :::
 *
 *   :::details[题解(C++)]   折叠块，渲染成原生 <details>
 *   内容
 *   :::
 *
 *   :::tabs                 标签页；用 ::tab[...] 分隔，不需要嵌套更多冒号
 *   ::tab[解法一]
 *   内容
 *   ::tab[解法二]
 *   内容
 *   :::
 *
 *   :::link[CSES 题库]{href="https://cses.fi/problemset/"}
 *   一句描述
 *   :::
 *
 *   :::grid{cols=2}         栅格；用 ::cell 分隔
 *   ::cell
 *   左边
 *   ::cell
 *   右边
 *   :::
 *
 * 两个关键的技术点，改这个文件前一定要知道：
 *
 * 1. **这是 remark 插件，跑在 mdast 上，不是 hast。** 所以不能直接造
 *    { type: 'element', properties: { className } } —— 那是 hast 的节点，
 *    remark-rehype 不认，className 会被静默丢掉，只剩一个没有样式的 <div>。
 *    正确做法是给 mdast 节点挂 data.hName / data.hProperties，
 *    由 mdast-util-to-hast 去生成真正的元素。
 *
 * 2. **需要一个「通用容器」载体。** mdast 没有通用的 div 节点，
 *    所以这里统一借 blockquote 当载体，再用 hName 把它改名成 div / details / a 等。
 *    你在产物里看不到任何 <blockquote>，因为它们全被改名了。
 *
 * 3. **标签页和栅格用「同级标记」而不是嵌套容器。** remark-directive 要求外层比内层
 *    多一个冒号（::::tabs 里放 :::tab），既难写又难记；用 ::tab / ::cell 这种
 *    leaf 指令做分隔符就不存在这个问题。
 */

const CALLOUT_TYPES = new Set(['tip', 'note', 'info', 'important', 'warning', 'danger', 'caution']);

const DEFAULT_TITLES = {
  tip: '提示',
  note: '注意',
  info: '信息',
  important: '重要',
  warning: '警告',
  danger: '危险',
  caution: '小心',
};

// ---------------------------------------------------------------- 构造 mdast 节点
/** 借 blockquote 当通用块级容器，靠 hName 改成想要的标签 */
function block(hName, hProperties, children = []) {
  return { type: 'blockquote', data: { hName, hProperties }, children };
}
function textNode(value) {
  return { type: 'text', value };
}
/** 一行纯文本的块级元素（标题、按钮、摘要等） */
function textBlock(hName, hProperties, value) {
  return { type: 'paragraph', data: { hName, hProperties }, children: [textNode(value)] };
}
/**
 * 行内元素的载体。
 * 注意：块级用 blockquote 当载体，行内必须换一个**行内**类型的节点，
 * 否则会造出"段落里套块级节点"的非法 mdast。emphasis 是行内的，正好。
 */
function inline(hName, hProperties, children = []) {
  return { type: 'emphasis', data: { hName, hProperties }, children };
}

// ---------------------------------------------------------------- 小工具
function collectText(node) {
  if (!node) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? '';
  return (node.children ?? []).map(collectText).join('');
}

/**
 * 取出 [标签] 文本。
 *
 * 注意一个坑：**容器指令和 leaf 指令的解析结果不一样**。
 *   :::link[CSES]{href=...}  → [标签] 会变成一个带 data.directiveLabel 的子段落
 *   ::tab[递归写法]          → [标签] 直接就是子节点，没有 directiveLabel 标记
 * 所以容器要"摘掉那个子节点"，leaf 只能整体取文字。
 */
function takeLabel(node) {
  const index = (node.children ?? []).findIndex((child) => child.data?.directiveLabel);
  if (index !== -1) {
    const [label] = node.children.splice(index, 1);
    return collectText(label).trim();
  }
  if (node.type === 'leafDirective') return collectText(node).trim();
  return '';
}

/** 递归处理一组子节点 */
function transform(children) {
  return (children ?? []).map(render);
}

// ---------------------------------------------------------------- 渲染
function render(node) {
  if (node.type === 'containerDirective') return renderContainer(node);

  // 行内指令：:spoiler[文字]
  if (node.type === 'textDirective') {
    if (node.name === 'spoiler') {
      return inline('span', { className: ['spoiler'] }, transform(node.children));
    }
    const label = takeLabel(node);
    return { type: 'paragraph', children: [textNode(label || `:${node.name}`)] };
  }

  // ::tab / ::cell / ::step 正常由父级容器消费掉；出现在别处时退化成普通段落，绝不吞内容
  if (node.type === 'leafDirective') {
    const label = takeLabel(node);
    return { type: 'paragraph', children: [textNode(label || `::${node.name}`)] };
  }

  if (node.children) node.children = transform(node.children);
  return node;
}

function renderContainer(node) {
  const name = node.name;
  const attributes = node.attributes ?? {};
  const label = takeLabel(node);

  // ---- 提示框 ----
  if (CALLOUT_TYPES.has(name)) {
    return block('div', { className: ['callout', `callout-${name}`] }, [
      textBlock('p', { className: ['callout-title'] }, label || DEFAULT_TITLES[name] || name),
      ...transform(node.children),
    ]);
  }

  // ---- 折叠块 ----
  if (name === 'details') {
    const body = (node.children ?? []).filter(
      (child) => !(child.type === 'text' && !child.value.trim()),
    );

    // 特例：如果折叠块里**只有一个代码块**，就不要"折叠标题栏 + 代码窗口"两层壳，
    // 而是合并成一个 Mac 窗口——标题进标题栏，右端加展开/收起按钮。
    // 全站 403 个题解折叠块都是这个形状，所以这条规则影响很大。
    if (body.length === 1 && body[0].type === 'code') {
      return block(
        'div',
        {
          className: ['fold-code'],
          dataFoldTitle: label || '展开',
          // 默认收起；CSS 只在 <html class="js"> 时才真的隐藏代码，
          // 所以禁用 JS 时内容依然完全可见（优雅降级）
          dataCollapsed: 'true',
        },
        transform(body),
      );
    }

    // 其它情况（折叠块里是正文/图文混排）保持原来的 <details> 形态
    return block('details', { className: ['fold', 'fold-info'] }, [
      textBlock('summary', { className: ['fold-summary'] }, label || '展开'),
      block('div', { className: ['fold-body'] }, transform(node.children)),
    ]);
  }

  // ---- 标签页 ----
  if (name === 'tabs') return renderTabs(node, label);

  // ---- 栅格 ----
  if (name === 'grid') return renderGrid(node, attributes);

  // ---- 步骤 / 时间线（都是"标记分隔"型，共用一套渲染）----
  if (name === 'steps') return renderSteps(node, 'steps');
  if (name === 'timeline') return renderSteps(node, 'timeline');

  // ---- 链接卡 ----
  if (name === 'link') {
    const href = attributes.href || '#';
    const external = /^https?:\/\//i.test(href);

    // 站外链接显示域名，站内链接显示一个 → 箭头
    let domain = '';
    if (external) {
      try {
        domain = new URL(href).hostname.replace(/^www\./, '');
      } catch {
        domain = '';
      }
    }

    const head = block(
      'div',
      { className: ['md-link-card-head'] },
      [
        // 头部的类型图标（站外=浏览器/地球，站内=文档），用 CSS mask 画
        block('span', { className: ['md-link-card-icon'], 'aria-hidden': 'true' }, []),
        textBlock('span', { className: ['md-link-card-title'] }, label || href),
        external && domain ? textBlock('span', { className: ['md-link-card-domain'] }, domain) : null,
        // 图标本身用 CSS mask 画（见 global.css 的 .md-link-card-arrow），
        // 站外是"外链"图标、站内是"文档"图标，一眼能分辨
        block('span', { className: ['md-link-card-arrow'], 'aria-hidden': 'true' }, []),
      ].filter(Boolean),
    );

    return block(
      'a',
      {
        className: ['md-link-card', external ? 'is-external' : 'is-internal'],
        href,
        ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
      },
      [head, block('div', { className: ['md-link-card-desc'] }, transform(node.children))],
    );
  }

  // ---- 未知指令：退化成带类名的 div，方便你以后自己扩展 ----
  return block('div', { className: ['md-directive', `md-directive-${name}`] }, transform(node.children));
}

function renderTabs(node, fallbackLabel) {
  const groups = [];
  let current = null;

  for (const child of node.children ?? []) {
    if (child.type === 'leafDirective' && child.name === 'tab') {
      current = { title: takeLabel(child) || `标签 ${groups.length + 1}`, children: [] };
      groups.push(current);
    } else if (current) {
      current.children.push(child);
    }
    // 第一个 ::tab 之前的内容会被忽略
  }

  // 没写 ::tab 就退化成普通块，避免整段内容凭空消失
  if (groups.length === 0) {
    return block('div', { className: ['md-directive', 'md-directive-tabs'] }, [
      textBlock('p', { className: ['callout-title'] }, fallbackLabel || '标签页'),
      ...transform(node.children),
    ]);
  }

  const nav = block(
    'div',
    { className: ['tabs-nav'], role: 'tablist' },
    groups.map((group, index) =>
      textBlock(
        'button',
        {
          type: 'button',
          className: ['tab-btn'],
          dataTab: String(index),
          role: 'tab',
          ariaSelected: index === 0 ? 'true' : 'false',
        },
        group.title,
      ),
    ),
  );

  const body = block(
    'div',
    { className: ['tabs-body'] },
    groups.map((group, index) =>
      block('div', { className: ['tab-panel'], dataTab: String(index) }, transform(group.children)),
    ),
  );

  return block('div', { className: ['md-tabs'] }, [nav, body]);
}

/**
 * :::steps / :::timeline —— 用 ::step[标题] 分隔的序列。
 *
 * 为什么用 ::step 而不是嵌套容器：同 tabs / grid，避开 remark-directive
 * "外层要比内层多一个冒号"的嵌套规则。
 * 视觉完全靠 CSS 计数器画，零 JS。
 */
function renderSteps(node, kind) {
  const groups = [];
  let current = null;

  for (const child of node.children ?? []) {
    if (child.type === 'leafDirective' && (child.name === 'step' || child.name === 'item')) {
      current = { title: takeLabel(child) || `${groups.length + 1}`, children: [] };
      groups.push(current);
    } else if (current) {
      current.children.push(child);
    }
  }

  if (groups.length === 0) {
    return block('div', { className: [`md-${kind}`] }, transform(node.children));
  }

  return block(
    'div',
    { className: [`md-${kind}`] },
    groups.map((group) =>
      block('div', { className: [`md-${kind}-item`] }, [
        textBlock('div', { className: [`md-${kind}-title`] }, group.title),
        block('div', { className: [`md-${kind}-body`] }, transform(group.children)),
      ]),
    ),
  );
}

function renderGrid(node, attributes) {
  const cells = [];
  let current = null;

  for (const child of node.children ?? []) {
    if (child.type === 'leafDirective' && child.name === 'cell') {
      current = [];
      cells.push(current);
    } else if (current) {
      current.push(child);
    }
  }

  if (cells.length === 0) cells.push(node.children ?? []);

  const columns = Number(attributes.cols) || cells.length;

  return block(
    'div',
    { className: ['md-grid'], style: `--md-grid-cols: ${columns}` },
    cells.map((cellChildren) => block('div', { className: ['md-grid-cell'] }, transform(cellChildren))),
  );
}

export default function remarkDirectives() {
  return (tree) => {
    tree.children = transform(tree.children);
  };
}
