const CACHE_NAME = 'works-site-v2'; // ★デプロイのたびにバージョンを上げる

const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/rogo.png',
  '/1.svg',
  '/2.svg',
  '/3.svg',
  '/4.svg',
];

self.addEventListener('install', e => {
  // 新しいSWをすぐに有効化
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  // 古いキャッシュをすべて削除
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // すぐに全クライアントを制御下に
  );
});

self.addEventListener('fetch', e => {
  // HTMLはネットワーク優先（常に最新を取得）
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    );
    return;
  }
  // その他はキャッシュ優先
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
