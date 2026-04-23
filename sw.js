// ★デプロイのたびにバージョンを上げる★
const CACHE_NAME = 'works-site-v202604230226';

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

// インストール：新しいSWをすぐ有効化
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// アクティベート：古いキャッシュをすべて削除
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// メッセージ受信：index.htmlからSKIP_WAITINGを受け取ったら即時切り替え
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// フェッチ：HTMLはネットワーク優先、他はキャッシュ優先
self.addEventListener('fetch', e => {
  // ナビゲーション（HTMLページ）は常にネットワークから取得
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // CSS・SVG・画像はキャッシュ優先（なければネットワーク）
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
