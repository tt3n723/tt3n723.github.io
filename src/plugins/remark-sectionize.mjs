/**
 * 把「标题 + 它管辖的正文」包成嵌套的 <section>。
 *
 * 为什么需要它：作者要的是"h3 连同它下面的正文整体缩进"，而不是只缩进标题。
 * 纯 CSS 表达不了"缩进到下一个同级标题为止"（没有 next-until 选择器），
 * 所以要在 AST 层把范围划出来。
 *
 *   ## A           →  <section> <h2>A</h2> <p>…</p>
 *   ### A.1               <section> <h3>A.1</h3> <p>…</p> </section>
 *   ## B                  </section>
 *                         <section> <h2>B</h2> … </section>
 *
 * Firefly 用的是 remark-sectionize 这个包；这里自己写 30 行，少一个依赖。
 */
export default function remarkSectionize() {
  return (tree) => {
    sectionize(tree);
  };
}

function sectionize(node) {
  if (!node.children?.length) return;

  const output = [];
  // 当前打开的 section 栈；每层记着它的标题深度
  const stack = [];

  for (const child of node.children) {
    const depth = child.type === 'heading' ? child.depth : null;

    if (depth !== null && depth >= 2 && depth <= 4) {
      // 关掉所有"同级或更深"的 section
      while (stack.length > 0 && stack[stack.length - 1].depth >= depth) stack.pop();

      const section = {
        type: 'blockquote',
        data: { hName: 'section', hProperties: { className: ['md-section'] } },
        children: [child],
      };

      if (stack.length > 0) stack[stack.length - 1].section.children.push(section);
      else output.push(section);

      stack.push({ depth, section });
    } else if (stack.length > 0) {
      stack[stack.length - 1].section.children.push(child);
    } else {
      output.push(child);
    }
  }

  node.children = output;
}
