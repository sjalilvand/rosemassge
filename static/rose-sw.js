self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.mode !== 'navigate' || request.method !== 'GET' ||
      new URL(request.url).pathname !== '/') return;
  event.respondWith(fetch(request).catch(() => new Response(
    '<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>رز</title><main><h1>اتصال برقرار نیست</h1><p>پس از وصل شدن اینترنت دوباره تلاش کنید.</p><a href="/">تلاش دوباره</a></main></html>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  )));
});
