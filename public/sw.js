const CACHE_NAME = 'smart-planner-v2.0.0'
const RUNTIME_CACHE = 'smart-planner-runtime-v2.0.0'

// ✅ فایل‌های اصلی که باید cache شوند
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// ✅ نصب
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Precaching app shell')
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => self.skipWaiting())
  )
})

// ✅ فعال‌سازی
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => 
            cacheName !== CACHE_NAME && 
            cacheName !== RUNTIME_CACHE
          )
          .map((cacheName) => {
            console.log('🗑️ Removing old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    }).then(() => self.clients.claim())
  )
})

// ✅ مدیریت درخواست‌ها
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // فقط GET
  if (request.method !== 'GET') return

  // فقط درخواست‌های هم‌دامنه
  if (url.origin !== location.origin && !url.href.includes('cdn.jsdelivr.net')) return

  // ✅ HTML / Navigation - Network first, fallback to cache
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html') || caches.match('/offline.html')
          })
        })
    )
    return
  }

  // ✅ فونت‌ها و CDN - Cache first
  if (
    url.href.includes('cdn.jsdelivr.net') ||
    url.href.includes('fonts.googleapis.com') ||
    url.href.includes('fonts.gstatic.com') ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        
        return fetch(request).then((response) => {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        }).catch(() => cached)
      })
    )
    return
  }

  // ✅ استاتیک‌ها (JS, CSS, Images) - Cache first با revalidate
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        }).catch(() => cached)
        
        return cached || fetchPromise
      })
    )
    return
  }

  // ✅ بقیه - Network first با cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }
        
        const responseClone = response.clone()
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone)
        })
        
        return response
      })
      .catch(() => caches.match(request))
  )
})

// ✅ Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        url: data.url || '/'
      },
      actions: [
        { action: 'open', title: 'مشاهده', icon: '/icon-72x72.png' },
        { action: 'close', title: 'بستن' }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'برنامه‌ریزی هوشمند', options)
    )
  } catch (error) {
    console.error('Push notification error:', error)
  }
})

// ✅ کلیک روی notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(location.origin) && 'focus' in client) {
            return client.focus().then(() => client.navigate(urlToOpen))
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// ✅ Background Sync (اختیاری)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  console.log('🔄 Background sync started')
  // اینجا می‌تونید داده‌ها رو به سرور sync کنید
}