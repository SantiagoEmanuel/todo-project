// Helpers de notificaciones del navegador (vía el service worker).

export function notificationsSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

function buildBody(texts: string[]): string {
  if (texts.length === 1) return `Pendiente: ${texts[0]}`;
  const preview = texts.slice(0, 3).join(", ");
  return `Tienes ${texts.length} tareas pendientes: ${preview}${texts.length > 3 ? "…" : ""}`;
}

export async function showPendingReminder(texts: string[]): Promise<void> {
  if (!texts.length) return;
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const icon = `${import.meta.env.BASE_URL}pwa-192.png`;
  const options: NotificationOptions = {
    body: buildBody(texts),
    tag: "todo-reminders",
    icon,
    badge: icon,
    data: { url: import.meta.env.BASE_URL },
  };
  // `renotify` re-alerta aunque se reutilice el mismo tag (no siempre está
  // en los tipos de TS según la versión del lib DOM).
  (options as NotificationOptions & { renotify?: boolean }).renotify = true;
  await reg.showNotification("Tareas pendientes ⏰", options);
}

// Notificación de un recordatorio por tarea (temporizador de la tarea).
export async function showTaskReminder(
  text: string,
  tagId: string,
): Promise<void> {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const icon = `${import.meta.env.BASE_URL}pwa-192.png`;
  const options: NotificationOptions = {
    body: text,
    tag: `todo-task-${tagId}`,
    icon,
    badge: icon,
    data: { url: import.meta.env.BASE_URL },
  };
  (options as NotificationOptions & { renotify?: boolean }).renotify = true;
  await reg.showNotification("⏰ Recordatorio de tarea", options);
}

export type TestResult = "ok" | "unsupported" | "denied" | "default" | "no-sw";

// Envía una notificación de prueba inmediata para verificar que el permiso,
// el service worker y la entrega de notificaciones funcionan en este
// dispositivo/navegador. Devuelve el motivo si no pudo enviarse.
export async function showTestNotification(): Promise<TestResult> {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission === "default") return "default";
  if (!("serviceWorker" in navigator)) return "no-sw";
  const reg = await navigator.serviceWorker.ready;
  const icon = `${import.meta.env.BASE_URL}pwa-192.png`;
  const options: NotificationOptions = {
    body: "Si ves esto, los recordatorios llegan correctamente ✅",
    tag: "todo-test",
    icon,
    badge: icon,
    data: { url: import.meta.env.BASE_URL },
  };
  (options as NotificationOptions & { renotify?: boolean }).renotify = true;
  await reg.showNotification("Notificación de prueba 🔔", options);
  return "ok";
}
