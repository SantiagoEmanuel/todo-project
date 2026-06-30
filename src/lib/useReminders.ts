import { useEffect } from "react";
import type { Todo } from "../types/todo.type";
import { showPendingReminder } from "./notifications";
import { registerServiceWorker } from "./pwa";
import {
  getPendingTasks,
  registerPeriodicSync,
  setPendingTasks,
} from "./reminders";

// Orquesta los recordatorios de tareas pendientes:
//  - registra el service worker (PWA),
//  - guarda el snapshot de pendientes en IndexedDB en cada cambio,
//  - dispara un recordatorio cada `intervalMin` mientras la app está abierta,
//  - registra Periodic Background Sync (best-effort) para segundo plano.
export function useReminders(
  todos: Todo[] | undefined,
  intervalMin: number,
): void {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  useEffect(() => {
    const pending = (todos ?? []).filter((t) => !t.done).map((t) => t.text);
    void setPendingTasks(pending);
  }, [todos]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!("serviceWorker" in navigator)) return;
      const reg = await navigator.serviceWorker.ready;
      if (!cancelled) await registerPeriodicSync(reg, intervalMin);
    })();

    const id = window.setInterval(
      async () => {
        const pending = await getPendingTasks();
        await showPendingReminder(pending);
      },
      intervalMin * 60 * 1000,
    );

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [intervalMin]);
}
