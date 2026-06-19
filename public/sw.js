const CACHE_NAME = "access-v2"
const STATIC_CACHE = "access-static-v2"
const API_CACHE = "access-api-v2"

const staticAssets = [
  "/",
  "/login",
  "/register",
  "/manifest.json",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(staticAssets))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE && k !== API_CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API requests: network-first with offline fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithFallback(request, API_CACHE))
    return
  }

  // Static assets / page navigations: cache-first
  if (request.mode === "navigate" || staticAssets.includes(url.pathname)) {
    event.respondWith(cacheFirstWithNetworkRefresh(request))
    return
  }

  // Everything else: network-first
  event.respondWith(networkFirstWithFallback(request, STATIC_CACHE))
})

async function networkFirstWithFallback(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    if (request.mode === "navigate") {
      return caches.match("/")
    }
    return new Response(JSON.stringify({ offline: true }), { status: 503, headers: { "Content-Type": "application/json" } })
  }
}

async function cacheFirstWithNetworkRefresh(request) {
  const cached = await caches.match(request)
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      caches.open(STATIC_CACHE).then((cache) => cache.put(request, response.clone()))
    }
    return response
  }).catch(() => cached)
  return cached || fetchPromise
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-payments") {
    event.waitUntil(syncPayments())
  }
})

async function syncPayments() {
  const db = await openDB()
  const pending = await db.getAll("pendingPayments")
  for (const payment of pending) {
    try {
      await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payment) })
      await db.delete("pendingPayments", payment.id)
    } catch {}
  }
}

// Push notification
self.addEventListener("push", (event) => {
  const data = event.data?.json() || { title: "Access School", body: "New update available" }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.svg",
      badge: "/icons/icon-96.svg",
      data: data.url || "/",
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data || "/"))
})

// IndexedDB for offline queue
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("AccessOffline", 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains("pendingPayments")) {
        db.createObjectStore("pendingPayments", { keyPath: "id" })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
