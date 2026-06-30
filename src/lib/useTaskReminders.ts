import { useEffect, useRef } from "react";
import type { Todo } from "../types/todo.type";
import { markTaskReminded } from "../utils/db.functions";
import { showTaskReminder } from "./notifications";

// setTimeout admite como máximo ~24.8 días; más allá no programamos en primer
// plano (lo cubriría el backend de push).
const MAX_DELAY = 2 ** 31 - 1;

// Programa una notificación por cada tarea con `remindAt` mientras la app está
// abierta. El envío con la app cerrada lo hace el backend (Web Push).
export function useTaskReminders(todos: Todo[] | undefined): void {
  const timers = useRef<Map<string, { handle: number; when: number }>>(
    new Map(),
  );

  useEffect(() => {
    const map = timers.current;
    const list = todos ?? [];
    const activeIds = new Set<string>();

    for (const todo of list) {
      if (todo.done || !todo.remindAt || todo.remindedAt) continue;
      const when = new Date(todo.remindAt).getTime();
      activeIds.add(todo.id);

      const existing = map.get(todo.id);
      if (existing && existing.when === when) continue;
      if (existing) {
        window.clearTimeout(existing.handle);
        map.delete(todo.id);
      }

      const fire = () => {
        map.delete(todo.id);
        void showTaskReminder(todo.text, todo.id);
        markTaskReminded(todo.id);
      };

      const delay = when - Date.now();
      if (delay <= 0) {
        fire();
      } else if (delay <= MAX_DELAY) {
        const handle = window.setTimeout(fire, delay);
        map.set(todo.id, { handle, when });
      }
    }

    // Limpia temporizadores de tareas que ya no aplican (completadas,
    // borradas o sin recordatorio).
    for (const [id, { handle }] of [...map.entries()]) {
      if (!activeIds.has(id)) {
        window.clearTimeout(handle);
        map.delete(id);
      }
    }
  }, [todos]);

  useEffect(() => {
    const map = timers.current;
    return () => {
      for (const { handle } of map.values()) window.clearTimeout(handle);
      map.clear();
    };
  }, []);
}
