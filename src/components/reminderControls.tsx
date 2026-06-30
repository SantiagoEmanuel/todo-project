import { useState } from "react";
import {
  notificationsSupported,
  requestPermission,
} from "../lib/notifications";
import { INTERVAL_OPTIONS, registerPeriodicSync } from "../lib/reminders";

export default function ReminderControls({
  intervalMin,
  onIntervalChange,
}: {
  intervalMin: number;
  onIntervalChange: (min: number) => void;
}) {
  const supported = notificationsSupported();
  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : "denied",
  );

  if (!supported) {
    return (
      <div className="border-t border-gray-300 px-2 py-2 text-[11px] text-gray-400">
        Tu navegador no soporta recordatorios.
      </div>
    );
  }

  const enable = async () => {
    const result = await requestPermission();
    setPermission(result);
    if (result === "granted" && "serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await registerPeriodicSync(reg, intervalMin);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 border-t border-gray-300 px-2 py-2 text-[11px] text-gray-500">
      {permission === "granted" ? (
        <>
          <span>🔔 Recordatorios activos</span>
          <label className="flex items-center gap-1">
            cada
            <select
              className="cursor-pointer rounded border border-gray-300 bg-transparent px-1 py-0.5"
              value={intervalMin}
              onChange={(e) => onIntervalChange(Number(e.target.value))}
            >
              {INTERVAL_OPTIONS.map((min) => (
                <option key={min} value={min}>
                  {min === 60 ? "1 h" : `${min} min`}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : permission === "denied" ? (
        <span className="text-gray-400">
          🔕 Notificaciones bloqueadas. Habilítalas en los ajustes del
          navegador.
        </span>
      ) : (
        <button
          className="flex cursor-pointer items-center gap-1 text-[#863bff] hover:underline"
          onClick={enable}
        >
          🔔 Activar recordatorios de tareas pendientes
        </button>
      )}
    </div>
  );
}
