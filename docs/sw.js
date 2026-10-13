// Retire only the old site's application caches. Imported books are untouched.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('jyothish-app-'))await caches.delete(key);await self.clients.claim();await self.registration.unregister()})()));
