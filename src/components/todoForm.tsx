import { motion } from "motion/react";
import type { Todo } from "../types/todo.type";
import { addTodo, toggleAll } from "../utils/db.functions";
import ChevronDownIcon from "./ui/chevronDownIcon";

export default function TodoForm({ todos }: { todos: Todo[] }) {
  const allDone = todos.length > 0 && todos.every((t) => t.done);

  return (
    <div className="flex h-14 items-center gap-1 border-b border-gray-200 px-2">
      <motion.button
        type="button"
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-default disabled:opacity-30"
        onClick={() => toggleAll(todos)}
        disabled={todos.length === 0}
        aria-label="Completar todas las tareas"
        title="Completar todas las tareas pendientes"
        whileTap={todos.length ? { scale: 0.9 } : undefined}
      >
        <motion.div
          className="h-5 w-5"
          animate={{ rotate: allDone ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDownIcon />
        </motion.div>
      </motion.button>
      <form
        className="flex h-full flex-1 items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.input as HTMLInputElement;
          const value = input.value.trim();
          if (!value) return;
          addTodo(value);
          e.currentTarget.reset();
          input.focus();
        }}
      >
        <input
          id="new-todo-input"
          className="h-full flex-1 bg-transparent px-1 text-sm capitalize outline-hidden placeholder:text-gray-400"
          autoFocus
          placeholder="¿Qué tarea quieres agregar?"
          type="text"
          name="input"
        />
        <motion.button
          type="submit"
          aria-label="Agregar tarea"
          title="Agregar tarea"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#863bff] text-white shadow-sm shadow-[#863bff]/30"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </motion.button>
      </form>
    </div>
  );
}
