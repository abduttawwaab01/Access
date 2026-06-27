const CACHE_NAME = "access-v5"
const STATIC_CACHE = "access-static-v5"
const API_CACHE = "access-api-v5"

const staticAssets = [
  "/",
  "/login",
  "/register",
  "/manifest.json",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      for (const url of staticAssets) {
        try {
          const res = await fetch(url)
          if (res.ok) cache.put(url, res)
        } catch {}
      }
    })
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
  if (self.registration?.navigationPreload) {
    self.registration.navigationPreload.enable()
  }
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(event.request, API_CACHE))
    return
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, STATIC_CACHE))
    return
  }

  if (staticAssets.includes(url.pathname)) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  event.respondWith(networkFirst(event.request, STATIC_CACHE))
})

async function networkFirst(request, cacheName) {
  if (request.method !== "GET") {
    try { return await fetch(request) } catch { return new Response(null, { status: 503 }) }
  }
  try {
    const response = await fetch(request)
    if (response.ok && !response.bodyUsed) {
      try {
        const cache = await caches.open(cacheName)
        cache.put(request, response.clone())
      } catch {}
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    if (request.mode === "navigate") {
      const root = await caches.match("/")
      if (root) return root
      return new Response("<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Offline</title><style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:2rem;text-align:center;background:#0b1121;color:#e2e8f0}h1{font-size:1.5rem;margin-bottom:0.5rem}p{color:#94a3b8;max-width:24rem;line-height:1.5}</style></head><body><h1>You're Offline</h1><p>Please check your internet connection and try again.</p></body></html>", { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } })
    }
    return new Response(JSON.stringify({ offline: true }), { status: 503, headers: { "Content-Type": "application/json" } })
  }
}

async function cacheFirst(request) {
  if (request.method !== "GET") {
    try { return await fetch(request) } catch { return new Response(null, { status: 503 }) }
  }
  const cached = await caches.match(request)
  if (cached) {
    fetch(request).then(async (response) => {
      if (response.ok && !response.bodyUsed) {
        try {
          const cache = await caches.open(STATIC_CACHE)
          cache.put(request, response.clone())
        } catch {}
      }
    }).catch(() => {})
    return cached
  }
  try {
    const response = await fetch(request)
    if (response.ok && !response.bodyUsed) {
      try {
        const cache = await caches.open(STATIC_CACHE)
        cache.put(request, response.clone())
      } catch {}
    }
    return response
  } catch {
    const root = await caches.match("/")
    if (root) return root
    return new Response("<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Offline</title><style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:2rem;text-align:center;background:#0b1121;color:#e2e8f0}h1{font-size:1.5rem;margin-bottom:0.5rem}p{color:#94a3b8;max-width:24rem;line-height:1.5}</style></head><body><h1>You're Offline</h1><p>Please check your internet connection and try again.</p></body></html>", { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } })
  }
}

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
