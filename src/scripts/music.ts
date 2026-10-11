// 音乐播放器。
//
// 关键取舍：<audio> 元素**在你第一次点播放时才创建**。
// 页面加载完全不碰音频文件，所以首屏不会被 2.5MB 的 mp3 拖慢。
export function initMusic() {
  const root = document.querySelector<HTMLElement>('[data-music-player]');
  if (!root || root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';

  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-music-item]'));
  if (items.length === 0) return;

  const titleEl = root.querySelector<HTMLElement>('[data-music-title]');
  const artistEl = root.querySelector<HTMLElement>('[data-music-artist]');
  const coverEl = root.querySelector<HTMLElement>('[data-music-cover]');
  const timeEl = root.querySelector<HTMLElement>('[data-music-time]');
  const progressEl = root.querySelector<HTMLElement>('[data-music-progress]');
  const barEl = root.querySelector<HTMLElement>('[data-music-bar]');
  const toggleBtn = root.querySelector<HTMLElement>('[data-music-toggle]');
  const prevBtn = root.querySelector<HTMLElement>('[data-music-prev]');
  const nextBtn = root.querySelector<HTMLElement>('[data-music-next]');

  let index = 0;
  let audio: HTMLAudioElement | null = null;
  let seeking = false;

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + String(s).padStart(2, '0');
  };

  const paintProgress = () => {
    if (!audio || seeking) return;
    const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
    if (barEl) barEl.style.width = (ratio * 100).toFixed(2) + '%';
    if (progressEl) progressEl.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    if (timeEl) {
      timeEl.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration || 0);
    }
  };

  const paintToggle = () => {
    const playing = !!audio && !audio.paused;
    root.classList.toggle('is-playing', playing);
    toggleBtn?.setAttribute('aria-label', playing ? '暂停' : '播放');
  };

  const ensureAudio = () => {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = 'metadata';
    audio.addEventListener('timeupdate', paintProgress);
    audio.addEventListener('loadedmetadata', paintProgress);
    audio.addEventListener('play', paintToggle);
    audio.addEventListener('pause', paintToggle);
    audio.addEventListener('ended', () => load(index + 1, true));
    document.body.appendChild(audio);
    return audio;
  };

  const load = (next: number, autoplay: boolean) => {
    index = (next + items.length) % items.length;
    const item = items[index];
    if (!item) return;

    if (titleEl) titleEl.textContent = item.dataset.title ?? '';
    if (artistEl) artistEl.textContent = item.dataset.artist ?? '';
    if (coverEl) {
      const cover = item.dataset.cover ?? '';
      coverEl.style.backgroundImage = cover ? 'url("' + cover + '")' : '';
    }
    items.forEach((entry, i) => entry.classList.toggle('is-current', i === index));

    const player = ensureAudio();
    player.src = item.dataset.src ?? '';
    if (barEl) barEl.style.width = '0%';
    if (timeEl) timeEl.textContent = '0:00 / 0:00';
    if (autoplay) void player.play().catch(() => paintToggle());
    paintToggle();
  };

  const toggle = () => {
    const player = ensureAudio();
    if (!player.src) {
      load(index, true);
      return;
    }
    if (player.paused) void player.play().catch(() => {});
    else player.pause();
  };

  toggleBtn?.addEventListener('click', toggle);
  prevBtn?.addEventListener('click', () => load(index - 1, true));
  nextBtn?.addEventListener('click', () => load(index + 1, true));

  // 点歌单里的歌一律从头播——不把"点正在播的那首"当成暂停，
  // 否则会让人以为"一切换就停了"
  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      if (i === index && audio) {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
        return;
      }
      load(i, true);
    });
  });

  // 进度条：点击 / 拖动 / 键盘
  const seekTo = (clientX: number) => {
    if (!audio || !progressEl || !audio.duration) return;
    const rect = progressEl.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    paintProgress();
  };

  progressEl?.addEventListener('pointerdown', (event) => {
    seeking = true;
    progressEl.setPointerCapture(event.pointerId);
    seekTo(event.clientX);
  });
  progressEl?.addEventListener('pointermove', (event) => {
    if (seeking) seekTo(event.clientX);
  });
  progressEl?.addEventListener('pointerup', (event) => {
    seeking = false;
    progressEl.releasePointerCapture(event.pointerId);
  });
  progressEl?.addEventListener('keydown', (event) => {
    if (!audio || !audio.duration) return;
    if (event.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    else if (event.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 5);
    else return;
    event.preventDefault();
    paintProgress();
  });
}
