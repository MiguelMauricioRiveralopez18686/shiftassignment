// Define el nombre de la caché para esta versión de la PWA
const CACHE_NAME = 'shift-assignment-cache-v1';
// Lista de activos que se deben precachear al instalar el Service Worker
const urlsToCache = [
  './index.html',
  './css/styles.css',
  './css/bootstrap.min.css',
  './js/algoritmo-shiftassignment.js',
  './js/bootstrap.bundle.min.js',
  './service-worker.js',
  './img/icons/icon-72x72.png',
  './img/icons/icon-96x96.png',
  './img/icons/icon-128x128.png',
  './img/icons/icon-144x144.png',
  './img/icons/icon-152x152.png',
  './img/icons/icon-192x192.png',
  './img/icons/icon-384x384.png',
  './img/icons/icon-512x512.png'
];

// Evento 'install': Se dispara cuando el Service Worker se instala
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  // Espera hasta que la promesa se resuelva
  event.waitUntil(
    // Abre una caché con el nombre definido
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando archivos estáticos');
        // Agrega todos los archivos de urlsToCache a la caché
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'activate': Se dispara cuando el Service Worker se activa
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  // Espera hasta que la promesa se resuelva
  event.waitUntil(
    // Obtiene todas las claves de caché existentes
    caches.keys().then((cacheNames) => {
      // Filtra las cachés que no coinciden con el CACHE_NAME actual
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Borrando caché antigua', cacheName);
            // Elimina las cachés antiguas
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento 'fetch': Se dispara cada vez que la página solicita un recurso
self.addEventListener('fetch', (event) => {
  // Solo intercepta las solicitudes HTTP/HTTPS (no extensiones, etc.)
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      // Intenta encontrar el recurso en la caché
      caches.match(event.request)
        .then((response) => {
          // Si el recurso está en caché, lo devuelve
          if (response) {
            return response;
          }
          // Si no está en caché, intenta obtenerlo de la red
          return fetch(event.request)
            .then((networkResponse) => {
              // Si la respuesta de la red es válida (200 OK y no opaca)
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              // Clona la respuesta de la red porque la respuesta original es un stream y solo se puede consumir una vez
              const responseToCache = networkResponse.clone();
              // Abre la caché y guarda el nuevo recurso
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              // Devuelve la respuesta de la red
              return networkResponse;
            })
            .catch(() => {
              // En caso de que la red falle y el recurso no esté en caché,
              // puedes devolver una página de fallback sin conexión aquí si lo deseas.
              console.log('Service Worker: Error de red y recurso no cacheado', event.request.url);
              // Para tu sitio, simplemente no hay una página de fallback específica, así que ignora.
            });
        })
    );
  }
});