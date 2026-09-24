// Quvanti Service Worker - Elite Caching Strategy
// Version: 1.0.0
const CACHE_VERSION = "quvanti-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/signals",
  "/agents/create",
  "/strategy-lab",
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[Service Worker] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[Service Worker] Installation complete");
        return self.skipWaiting(); // Activate immediately
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name.startsWith("quvanti-") &&
                name !== STATIC_CACHE &&
                name !== DYNAMIC_CACHE &&
                name !== API_CACHE,
            )
            .map((name) => {
              console.log("[Service Worker] Deleting old cache:", name);
              return caches.delete(name);
            }),
        );
      })
      .then(() => {
        console.log("[Service Worker] Activation complete");
        return self.clients.claim(); // Take control immediately
      }),
  );
});

// Fetch event - stale-while-revalidate strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests (e.g., external APIs)
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - network-first with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response to cache it
          const responseClone = response.clone();
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log(
                "[Service Worker] Serving API from cache (offline):",
                url.pathname,
              );
              return cachedResponse;
            }
            // No cache available, return offline response
            return new Response(
              JSON.stringify({
                error: "offline",
                message:
                  "You are currently offline. Please check your connection.",
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              },
            );
          });
        }),
    );
    return;
  }

  // HTML pages - stale-while-revalidate
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            // Update cache with fresh response
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
            return networkResponse;
          })
          .catch(() => {
            // Network failed, show offline page if no cache
            if (!cachedResponse) {
              return caches.match("/offline");
            }
          });

        // Return cached version immediately, then update in background
        return cachedResponse || fetchPromise;
      }),
    );
    return;
  }

  // Static assets (JS, CSS, images) - cache-first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache, update in background
        fetch(request)
          .then((networkResponse) => {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, networkResponse);
            });
          })
          .catch(() => {
            // Network failed, but we have cache - all good
          });
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request)
        .then((networkResponse) => {
          // Cache the new asset
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch(() => {
          // Network failed and no cache - return offline fallback
          if (request.destination === "image") {
            return caches.match("/icons/icon-192x192.png");
          }
        });
    }),
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-agents") {
    event.waitUntil(syncAgents());
  }
});

async function syncAgents() {
  try {
    // Sync any pending agent creations or updates
    const cache = await caches.open(API_CACHE);
    const requests = await cache.keys();
    const agentRequests = requests.filter((req) =>
      req.url.includes("/api/agents"),
    );

    for (const request of agentRequests) {
      try {
        const response = await fetch(request);
        await cache.put(request, response.clone());
      } catch (error) {
        console.error("[Service Worker] Sync failed for:", request.url, error);
      }
    }
  } catch (error) {
    console.error("[Service Worker] Background sync failed:", error);
  }
}

// Push notifications (for future use)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Quvanti Alert";
  const options = {
    body: data.body || "New trading signal available",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "quvanti-notification",
    requireInteraction: true,
    actions: [
      { action: "view", title: "View", icon: "/icons/view-action.png" },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/dismiss-action.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || "/dashboard"),
    );
  }
});

console.log("[Service Worker] Loaded and ready");



