import { AnimatePresence, motion } from "motion/react";
import type { Todo } from "../types/todo.type";
import { addItem, deleteItem, toggleItem } from "../utils/db.functions";
import TaskReminder from "./taskReminder";
import Checkbox from "./ui/checkbox";

export default function TodoItems({ todo }: { todo: Todo }) {
  const items = [...todo.items].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
  );

  return (
    <div className="border-t border-gray-100 bg-gray-50/70 pl-11">
      <TaskReminder todo={todo} />
      <div className="divide-y divide-gray-100">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              className="flex h-9 items-center gap-2 pr-2"
            >
              <Checkbox
                size="h-4 w-4"
                checked={item.done}
                onChange={() => toggleItem(item)}
                ariaLabel={`Marcar "${item.text}" como completado`}
              />
              <button
                type="button"
                className="flex min-w-0 flex-1 cursor-pointer items-center overflow-hidden text-left"
                onClick={() => toggleItem(item)}
              >
                <span
                  className={`truncate text-xs capitalize transition-colors duration-300 ${
                    item.done ? "text-gray-400 line-through" : "text-gray-600"
                  }`}
                >
                  {item.text}
                </span>
              </button>
              <button
                type="button"
                className="flex h-7 w-7 cursor-pointer items-center justify-center text-gray-300 transition-colors hover:text-red-500"
                onClick={() => deleteItem(item)}
                aria-label="Eliminar microobjetivo"
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <form
        className="flex h-9 items-center gap-1 border-t border-gray-100 pr-2"
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.item as HTMLInputElement;
          const value = input.value.trim();
          if (!value) return;
          addItem(todo.id, value);
          e.currentTarget.reset();
          input.focus();
        }}
      >
        <input
          className="h-full flex-1 bg-transparent px-1 text-xs capitalize outline-hidden placeholder:text-gray-400"
          placeholder="+ Agregar microobjetivo"
          type="text"
          name="item"
        />
        <motion.button
          type="submit"
          aria-label="Agregar microobjetivo"
          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#863bff]/90 text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </motion.button>
      </form>
    </div>
  );
}
