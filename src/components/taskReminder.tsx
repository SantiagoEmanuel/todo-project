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
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-2 py-1.5 text-[11px] text-gray-500">
      <span className="whitespace-nowrap">⏰ Recordar el</span>
      <input
        type="datetime-local"
        className="rounded border border-gray-300 bg-transparent px-1 py-0.5"
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
        <button
          key={p.minutes}
          className="cursor-pointer rounded border border-gray-300 px-1.5 py-0.5 hover:bg-gray-100"
          onClick={() =>
            setTaskReminder(todo.id, new Date(Date.now() + p.minutes * 60_000))
          }
        >
          {p.label}
        </button>
      ))}
      {remindAt && (
        <>
          <span className={isPast ? "text-gray-400" : "text-[#863bff]"}>
            {status}
          </span>
          <button
            className="cursor-pointer text-gray-400 underline hover:text-gray-600"
            onClick={() => clearTaskReminder(todo.id)}
          >
            quitar
          </button>
        </>
      )}
    </div>
  );
}
