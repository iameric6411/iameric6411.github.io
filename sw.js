// 簡易 service worker:首次載入後 stale-while-revalidate,離線可開所有頁面。
// 升級資料/腳本時把 CACHE 版號 bump 即可強制更新。
const CACHE='im-v1-2026-06-13';
const ASSETS=[
  '/','/index.html',
  '/ecg/','/acls/','/flow/','/labs/','/abg/','/anemia/',
  '/data/labs.json','/data/search-extras.json',
  '/manifest.webmanifest','/icon-192.png','/icon-512.png',
];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    // 個別 add — 任何一個失敗不要整批爆
    await Promise.all(ASSETS.map(u=>c.add(u).catch(()=>{})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;     // 不處理 GoatCounter 等第三方
  e.respondWith((async()=>{
    const cached=await caches.match(req);
    const network=fetch(req).then(async r=>{
      if(r&&r.ok){const c=await caches.open(CACHE);c.put(req,r.clone()).catch(()=>{});}
      return r;
    }).catch(()=>null);
    return cached||network||caches.match('/')||new Response('離線且無快取',{status:503});
  })());
});
