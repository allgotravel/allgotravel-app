const CACHE_NAME = 'allgo-v1'

// Páginas y assets a pre-cachear al instalar el SW
const PRECACHE_URLS = [
  '/es',
  '/en',
  '/es/perfil',
  '/en/perfil',
  '/offline',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Solo interceptar GET de páginas/assets propios (no API calls)
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET') return
  if (url.pathname.startsWith('/api/')) return
  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cachear respuestas exitosas de navegación y assets estáticos
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() =>
        // Sin conexión: devolver desde cache o la página offline
        caches.match(event.request).then(
          (cached) => cached || caches.match('/offline') || new Response('Offline', { status: 503 })
        )
      )
  )
})
