/**
 * rehype-figure —— 把"段落里只有一张图"的情况变成 <figure> + <figcaption>。
 *
 *   ![算法示意](img.png)   →   <figure><img><figcaption>算法示意</figcaption></figure>
 *
 * alt 文字本来就必须写（无障碍要求），顺手拿来做题注是白捡的。
 * 如果 alt 是空的，就原样不动——不会生成一个空题注。
 */
export default function rehypeFigure() {
  return (tree) => {
    const walk = (node) => {
      const children = node.children ?? [];
      node.children = children.map((child) => {
        if (child.type === 'element' && child.tagName === 'p') {
          const meaningful = (child.children ?? []).filter(
            (item) => !(item.type === 'text' && !item.value.trim()),
          );
          const only = meaningful[0];
          if (
            meaningful.length === 1 &&
            only.type === 'element' &&
            only.tagName === 'img'
          ) {
            const alt = only.properties?.alt;
            const caption = typeof alt === 'string' ? alt.trim() : '';
            if (caption) {
              // 题注已经显示了文字，alt 再重复一遍会被读屏读两次
              only.properties.alt = '';
              return {
                type: 'element',
                tagName: 'figure',
                properties: { className: ['md-figure'] },
                children: [
                  only,
                  {
                    type: 'element',
                    tagName: 'figcaption',
                    properties: {},
                    children: [{ type: 'text', value: caption }],
                  },
                ],
              };
            }
          }
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}
