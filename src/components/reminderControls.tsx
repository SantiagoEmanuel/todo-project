import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  notificationsSupported,
  requestPermission,
  showTestNotification,
  type TestResult,
} from "../lib/notifications";
import {
  getPushSubscription,
  pushConfigured,
  pushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "../lib/push";
import { INTERVAL_OPTIONS, registerPeriodicSync } from "../lib/reminders";

const TEST_FEEDBACK: Record<TestResult, string> = {
  ok: "Notificación enviada ✅",
  unsupported: "Tu navegador no soporta notificaciones.",
  denied: "Notificaciones bloqueadas en los ajustes del navegador.",
  default: "Primero activa los recordatorios.",
  "no-sw": "El service worker no está disponible.",
};

const pillButton =
  "cursor-pointer rounded-full border border-gray-200 px-2.5 py-1 transition-colors hover:bg-gray-100";

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
  const [pushOn, setPushOn] = useState(false);

  useEffect(() => {
    if (!pushConfigured() || !pushSupported()) return;
    void getPushSubscription().then((sub) => setPushOn(Boolean(sub)));
  }, []);

  if (!supported) {
    return (
      <div className="border-t border-gray-200 px-3 py-2.5 text-[11px] text-gray-400">
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

  const togglePush = async () => {
    if (pushOn) {
      await unsubscribeFromPush();
      setPushOn(false);
      flash("Recordatorios con la app cerrada desactivados.");
    } else {
      const ok = await subscribeToPush(intervalMin);
      setPushOn(ok);
      flash(ok ? "Push activado ✅" : "No se pudo activar el push.");
    }
  };

  const testPush = async () => {
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}api/test-push`, {
        method: "POST",
      });
      const j = (await r.json().catch(() => ({}))) as {
        sent?: number;
        error?: string;
      };
      flash(
        r.ok
          ? `Push enviado a ${j.sent ?? 0} dispositivo(s) ✅`
          : `Error: ${j.error ?? r.status}`,
      );
    } catch {
      flash("No se pudo contactar al servidor.");
    }
  };

  const showPushRow =
    permission === "granted" && pushConfigured() && pushSupported();

  return (
    <div className="flex flex-col gap-1.5 border-t border-gray-200 px-3 py-2.5 text-[11px] text-gray-500">
      <div className="flex items-center justify-between gap-2">
        {permission === "granted" ? (
          <>
            <span>🔔 Recordatorios activos</span>
            <div className="flex items-center gap-2">
              <motion.button
                className={pillButton}
                onClick={test}
                whileTap={{ scale: 0.94 }}
              >
                Probar
              </motion.button>
              <label className="flex items-center gap-1">
                cada
                <select
                  className="cursor-pointer rounded-full border border-gray-200 bg-transparent px-2 py-1 transition-colors hover:bg-gray-100"
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
          <motion.button
            className="flex cursor-pointer items-center gap-1 text-[#863bff] hover:underline"
            onClick={enable}
            whileTap={{ scale: 0.97 }}
          >
            🔔 Activar recordatorios de tareas pendientes
          </motion.button>
        )}
      </div>
      {showPushRow && (
        <div className="flex items-center justify-between gap-2">
          <span>
            {pushOn
              ? "📲 Recordatorios con la app cerrada activos"
              : "📲 Recibir recordatorios con la app cerrada"}
          </span>
          <div className="flex items-center gap-2">
            {pushOn && (
              <motion.button
                className={pillButton}
                onClick={testPush}
                whileTap={{ scale: 0.94 }}
              >
                Probar push
              </motion.button>
            )}
            <motion.button
              className={pillButton}
              onClick={togglePush}
              whileTap={{ scale: 0.94 }}
            >
              {pushOn ? "Desactivar" : "Activar"}
            </motion.button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {feedback && (
          <motion.span
            className="text-gray-400"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {feedback}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
