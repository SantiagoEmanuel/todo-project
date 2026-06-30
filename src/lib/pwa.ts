// Registro del service worker que hace la app instalable (PWA) y habilita
// los recordatorios en segundo plano.

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
      { scope: import.meta.env.BASE_URL },
    );
  } catch {
    return null;
  }
}
