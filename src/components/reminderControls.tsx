import { useState } from "react";
import {
  notificationsSupported,
  requestPermission,
  showTestNotification,
  type TestResult,
} from "../lib/notifications";
import { INTERVAL_OPTIONS, registerPeriodicSync } from "../lib/reminders";

const TEST_FEEDBACK: Record<TestResult, string> = {
  ok: "Notificación enviada ✅",
  unsupported: "Tu navegador no soporta notificaciones.",
  denied: "Notificaciones bloqueadas en los ajustes del navegador.",
  default: "Primero activa los recordatorios.",
  "no-sw": "El service worker no está disponible.",
};

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
  const [feedback, setFeedback] = useState<string>("");

  if (!supported) {
    return (
      <div className="border-t border-gray-300 px-2 py-2 text-[11px] text-gray-400">
        Tu navegador no soporta recordatorios.
      </div>
    );
  }

  const flash = (msg: string) => {
    setFeedback(msg);
    window.setTimeout(() => setFeedback(""), 3000);
  };

  const enable = async () => {
    const result = await requestPermission();
    setPermission(result);
    if (result === "granted" && "serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await registerPeriodicSync(reg, intervalMin);
      // Confirmación inmediata de que las notificaciones llegan.
      const test = await showTestNotification();
      flash(TEST_FEEDBACK[test]);
    }
  };

  const test = async () => {
    const result = await showTestNotification();
    flash(TEST_FEEDBACK[result]);
  };

  return (
    <div className="flex flex-col gap-1 border-t border-gray-300 px-2 py-2 text-[11px] text-gray-500">
      <div className="flex items-center justify-between gap-2">
        {permission === "granted" ? (
          <>
            <span>🔔 Recordatorios activos</span>
            <div className="flex items-center gap-2">
              <button
                className="cursor-pointer rounded border border-gray-300 px-1.5 py-0.5 hover:bg-gray-100"
                onClick={test}
              >
                Probar
              </button>
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
            </div>
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
      {feedback && <span className="text-gray-400">{feedback}</span>}
    </div>
  );
}
