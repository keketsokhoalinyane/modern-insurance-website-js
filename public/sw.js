// Service Worker for offline support and mobile optimization
const CACHE_NAME = "tembichat-v1"
const urlsToCache = [
  "/",
  "/app",
  "/login",
  "/register",
  "/app/messages",
  "/app/matches",
  "/app/profile",
  "/app/subscription",
  // Add other static assets
]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event - Network first, then cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If we got a response, add it to the cache
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
      }),
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
