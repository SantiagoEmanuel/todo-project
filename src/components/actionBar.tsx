import { motion } from "motion/react";
import type { Todo } from "../types/todo.type";
import { deleteCompleted } from "../utils/db.functions";

export function ActionBar({ todos }: { todos: Todo[] }) {
  const total = todos.length;
  const pending = todos.filter((todo) => !todo.done).length;
  const pct = total === 0 ? 0 : Math.round(((total - pending) / total) * 100);

  return (
    <div className="border-t border-gray-200 px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
        <span>
          {pending === 0 && total > 0
            ? "¡Todo listo! 🎉"
            : `Pendientes: ${pending}`}
        </span>
        <button
          disabled={pending !== 0}
          className="cursor-pointer text-gray-500 transition-colors hover:text-gray-700 disabled:cursor-default disabled:text-gray-300"
          onClick={() => deleteCompleted(todos)}
        >
          Eliminar completados
        </button>
      </div>
      {total > 0 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-[#863bff]"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </div>
      )}
    </div>
  );
}
