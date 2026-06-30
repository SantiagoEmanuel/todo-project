/* Service worker de la app de Tareas.
 * - Cachea el app shell para que funcione offline (PWA instalable).
 * - Muestra recordatorios de tareas pendientes vía Periodic Background Sync
 *   (best-effort: el navegador decide la frecuencia real) leyendo el estado
 *   que la app guarda en IndexedDB.
 */

const CACHE = "tareas-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./pwa-192.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Network-first para navegación, cache-first para el resto (best-effort).
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match("./index.html").then((r) => r || caches.match("./")),
      ),
    );
    return;
  }
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});

// --- IndexedDB: leer tareas pendientes que guarda la app ---
const DB_NAME = "todo-reminders";
const STORE = "state";
const KEY = "pending";

function openDB() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function getPending() {
  return openDB().then(
    (db) =>
      new Promise((resolve) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(KEY);
        req.onsuccess = () =>
          resolve(Array.isArray(req.result) ? req.result : []);
        req.onerror = () => resolve([]);
      }),
  );
}

function buildBody(texts) {
  if (texts.length === 1) return `Pendiente: ${texts[0]}`;
  const preview = texts.slice(0, 3).join(", ");
  return `Tienes ${texts.length} tareas pendientes: ${preview}${texts.length > 3 ? "…" : ""}`;
}

function showReminder() {
  return getPending().then((texts) => {
    if (!texts.length) return;
    return self.registration.showNotification("Tareas pendientes ⏰", {
      body: buildBody(texts),
      tag: "todo-reminders",
      renotify: true,
      icon: "./pwa-192.png",
      badge: "./pwa-192.png",
      data: { url: "./" },
    });
  });
}

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "todo-reminders") event.waitUntil(showReminder());
});

// Permite que la app dispare un recordatorio inmediato desde primer plano.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "REMIND")
    event.waitUntil(showReminder());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const c of clients) {
          if ("focus" in c) return c.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow("./");
      }),
  );
});
