/**
 * 构建时生成 /sw.js（Service Worker）。
 *
 * 为什么用端点而不是 public/sw.js：缓存名里必须带「每次构建都不同」的标识，
 * 浏览器才会装新 SW、换新缓存。public/ 里的文件是原样复制的，注入不了构建时间。
 */
export const prerender = true;

export async function GET() {
  const version = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const body = `// 由 src/pages/sw.js.ts 在构建时生成 —— 不要直接改 dist/sw.js
// CACHE 名字里带构建时间戳，所以每次部署这个文件都会变，浏览器必定装新 SW、换新缓存。
const VERSION = '__VERSION__';
const CACHE = 'wizard-note-' + VERSION;

// 装好就能用的东西（离线页本身必须在，否则断网时无处可去）
const PRECACHE = ['/offline/', '/favicon.svg', '/apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function cacheFirst(request) {
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((res) => {
        if (res && res.ok) cache.put(request, res.clone());
        return res;
      });
    }),
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // ① 带哈希的构建产物：内容一变文件名就变，可以永久缓存
  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ② 图片 / 音乐 / 字体 / 视频：缓存优先
  if (/\\.(webp|jpe?g|png|svg|gif|avif|ico|woff2?|ttf|otf|mp3|mp4|webm)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ③ 页面导航：缓存优先 + 后台更新（方案 B）
  //    先用本机副本秒开，同时去网上拿最新一份换掉它 —— 所以下一次打开就是新的。
  const isPage =
    request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
  if (isPage) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res && res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => null);
        if (hit) {
          event.waitUntil(network);
          return hit;
        }
        const fresh = await network;
        return fresh || (await cache.match('/offline/')) || Response.error();
      }),
    );
  }
});
`.replace('__VERSION__', version);
  return new Response(body, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
