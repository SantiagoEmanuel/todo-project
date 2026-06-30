import { motion } from "motion/react";
import type { Todo } from "../types/todo.type";
import { clearTaskReminder, setTaskReminder } from "../utils/db.functions";

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

const PRESETS: { label: string; minutes: number }[] = [
  { label: "+30 min", minutes: 30 },
  { label: "+1 h", minutes: 60 },
  { label: "+3 h", minutes: 180 },
];

export default function TaskReminder({ todo }: { todo: Todo }) {
  const remindAt = todo.remindAt ? new Date(todo.remindAt) : null;
  const isPast = remindAt ? remindAt.getTime() <= Date.now() : false;

  const status = !remindAt
    ? ""
    : todo.remindedAt
      ? "enviado ✓"
      : isPast
        ? "pendiente de envío"
        : "programado";

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-2 py-2 text-[11px] text-gray-500">
      <span className="whitespace-nowrap">⏰ Recordar el</span>
      <input
        type="datetime-local"
        className="rounded-full border border-gray-200 bg-transparent px-2 py-1 transition-colors hover:bg-white"
        value={remindAt ? toLocalInputValue(remindAt) : ""}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) {
            clearTaskReminder(todo.id);
            return;
          }
          setTaskReminder(todo.id, new Date(v));
        }}
      />
      {PRESETS.map((p) => (
        <motion.button
          key={p.minutes}
          className="cursor-pointer rounded-full border border-gray-200 px-2 py-1 transition-colors hover:bg-white"
          whileTap={{ scale: 0.92 }}
          onClick={() =>
            setTaskReminder(todo.id, new Date(Date.now() + p.minutes * 60_000))
          }
        >
          {p.label}
        </motion.button>
      ))}
      {remindAt && (
        <>
          <motion.span
            key={status}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={isPast ? "text-gray-400" : "text-[#863bff]"}
          >
            {status}
          </motion.span>
          <button
            className="cursor-pointer text-gray-400 underline transition-colors hover:text-gray-600"
            onClick={() => clearTaskReminder(todo.id)}
          >
            quitar
          </button>
        </>
      )}
    </div>
  );
}
