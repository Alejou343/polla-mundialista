// Service worker mínimo: habilita el prompt de instalación PWA en Chrome.
// No cachea recursos porque la app necesita red para todo (Supabase).
// Si querés agregar offline shell en el futuro, este es el lugar.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch handler vacío: Chrome lo requiere para considerar la PWA "installable".
// eslint-disable-next-line no-unused-vars
self.addEventListener("fetch", (event) => {
  // pass-through al network
});
