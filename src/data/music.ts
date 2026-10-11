/**
 * 歌单。
 *
 * 音频文件直接放在 public/music/ 里由 GitHub Pages 提供——
 * GitHub Pages 支持 HTTP Range 请求，所以拖动进度条、跳播都正常。
 * （Firefly 也是这么干的：public/assets/music/xxx.mp3）
 *
 * 加歌：把 mp3 丢进 public/music/，再在这里加一行。
 */
export interface MusicTrack {
  title: string;
  artist: string;
  /** public/ 下的路径，例如 /music/xxx.mp3 */
  src: string;
  /** 封面图路径，可选 */
  cover?: string;
}

export const MUSIC_PLAYLIST: MusicTrack[] = [
  {
    title: 'Luvsick',
    artist: 'Collin Lim',
    src: '/music/Collin Lim - Luvsick.mp3',
  },
];
