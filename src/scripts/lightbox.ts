// 正文图片点击放大。
//
// 纯手写、零依赖：点图 → 全屏遮罩 + 原图；点任意处 / ESC 关闭；
// 左右方向键在同篇文章的图之间切换。给 <img> 加 .no-lightbox 可以跳过。
export function initLightbox() {
  if (document.querySelector('[data-lightbox]')) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('data-lightbox', '');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', '图片预览');
  overlay.hidden = true;
  overlay.innerHTML =
    '<button class="lightbox-close" type="button" aria-label="关闭">×</button>' +
    '<img class="lightbox-img" alt="" />';
  document.body.appendChild(overlay);

  const image = overlay.querySelector<HTMLImageElement>('.lightbox-img')!;
  const closeBtn = overlay.querySelector<HTMLButtonElement>('.lightbox-close')!;

  const sources: { src: string; alt: string }[] = [];
  let current = 0;

  const paint = () => {
    const entry = sources[current];
    if (!entry) return;
    image.src = entry.src;
    image.alt = entry.alt;
  };

  const open = (index: number) => {
    current = index;
    paint();
    overlay.hidden = false;
    document.body.classList.add('lightbox-open');
    closeBtn.focus();
  };

  const close = () => {
    overlay.hidden = true;
    document.body.classList.remove('lightbox-open');
    image.removeAttribute('src');
  };

  const step = (delta: number) => {
    if (sources.length === 0) return;
    current = (current + delta + sources.length) % sources.length;
    paint();
  };

  overlay.addEventListener('click', (event) => {
    if (event.target === image) return; // 点图本身不关
    close();
  });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowRight') step(1);
    else if (event.key === 'ArrowLeft') step(-1);
  });

  document.querySelectorAll<HTMLImageElement>('.prose img:not(.no-lightbox)').forEach((img) => {
    const index = sources.length;
    sources.push({ src: img.currentSrc || img.src, alt: img.alt ?? '' });
    img.classList.add('is-zoomable');
    img.addEventListener('click', () => open(index));
  });
}
