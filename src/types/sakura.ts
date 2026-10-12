// 樱花特效类型定义（照搬 Firefly 的 src/types/sakura-worker.ts + effectsConfig.ts，合并成一份）
export type SakuraConfig = {
  enable: boolean;
  sakuraNum: number;
  limitTimes: number; // 越界限制次数，-1 为无限循环
  size: { min: number; max: number };
  opacity: { min: number; max: number };
  speed: {
    horizontal: { min: number; max: number };
    vertical: { min: number; max: number };
    rotation: number;
    fadeSpeed: number;
  };
  zIndex: number;
};

/** 主线程 -> Worker */
export type SakuraWorkerInboundMessage =
  | { type: 'init'; config: SakuraConfig; canvas: OffscreenCanvas; width: number; height: number }
  | { type: 'start' }
  | { type: 'stop' }
  | { type: 'resize'; width: number; height: number }
  | { type: 'visibilitychange'; hidden: boolean };

/** Worker -> 主线程 */
export type SakuraWorkerOutboundMessage =
  | { type: 'ready' }
  | { type: 'error'; message: string; stack?: string }
  | { type: 'messageError'; message: string };
