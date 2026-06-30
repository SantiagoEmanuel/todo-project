// Estado compartido de recordatorios: persiste las tareas pendientes en
// IndexedDB (para que el service worker pueda leerlas en segundo plano) y
// gestiona el intervalo elegido por el usuario.

const DB_NAME = "todo-reminders";
const STORE = "state";
const KEY = "pending";

export const INTERVAL_STORAGE_KEY = "reminder-interval-min";
export const DEFAULT_INTERVAL_MIN = 45;
export const INTERVAL_OPTIONS = [45, 60] as const;

export function getIntervalMin(): number {
  const raw = localStorage.getItem(INTERVAL_STORAGE_KEY);
  const n = raw ? parseInt(raw, 10) : NaN;
  return (INTERVAL_OPTIONS as readonly number[]).includes(n)
    ? n
    : DEFAULT_INTERVAL_MIN;
}

export function setStoredIntervalMin(min: number): void {
  localStorage.setItem(INTERVAL_STORAGE_KEY, String(min));
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function setPendingTasks(texts: string[]): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(texts, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getPendingTasks(): Promise<string[]> {
  const db = await openDB();
  const result = await new Promise<string[]>((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
    req.onerror = () => resolve([]);
  });
  db.close();
  return result;
}

// Periodic Background Sync: recordatorios aunque la app no esté en primer
// plano. Es best-effort — solo en navegadores que lo soportan y con la PWA
// instalada; el navegador decide la frecuencia real.
export async function registerPeriodicSync(
  reg: ServiceWorkerRegistration,
  minutes: number,
): Promise<void> {
  const periodicSync = (
    reg as unknown as {
      periodicSync?: {
        register: (tag: string, opts: { minInterval: number }) => Promise<void>;
      };
    }
  ).periodicSync;
  if (!periodicSync) return;
  try {
    const status = await navigator.permissions.query({
      name: "periodic-background-sync" as PermissionName,
    });
    if (status.state === "denied") return;
    await periodicSync.register("todo-reminders", {
      minInterval: minutes * 60 * 1000,
    });
  } catch {
    // No soportado o la PWA no está instalada: usamos el temporizador en
    // primer plano como respaldo.
  }
}
