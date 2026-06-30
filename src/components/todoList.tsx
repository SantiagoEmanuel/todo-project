import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Todo } from "../types/todo.type";
import { deleteTodo, toggleDone } from "../utils/db.functions";
import CompleteTodoModal from "./completeTodoModal";
import TodoItems from "./todoItems";
import Checkbox from "./ui/checkbox";
import ChevronDownIcon from "./ui/chevronDownIcon";

export default function TodoList({ todos }: { todos: Todo[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [todoCompleted, setTodoCompleted] = useState<string>("");
  const [showCompletedModal, setShowCompletedModal] = useState(false);

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  useEffect(() => {
    if (todoCompleted !== "") {
      setShowCompletedModal(true);
    }
  }, [todoCompleted]);

  if (todos.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.span
          className="text-4xl"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.span>
        <p className="text-sm text-gray-500">No tienes tareas todavía.</p>
        <p className="text-xs text-gray-400">Agrega la primera arriba.</p>
      </motion.div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      <AnimatePresence initial={false}>
        {todos.map((todo) => {
          const isOpen = expanded.has(todo.id);
          const total = todo.items.length;
          const completed = todo.items.filter((item) => item.done).length;
          if (completed === total && total > 0) {
            setTodoCompleted(todo.id);
          }
          return (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            >
              <div className="flex h-14 items-center gap-3 px-3 transition-colors hover:bg-gray-50">
                <Checkbox
                  checked={todo.done}
                  onChange={() => toggleDone(todo)}
                  ariaLabel={`Marcar "${todo.text}" como completada`}
                />
                <button
                  type="button"
                  className="flex min-w-0 flex-1 cursor-pointer items-center px-1 text-left"
                  onClick={() => toggleExpanded(todo.id)}
                >
                  <span
                    className={`truncate text-sm capitalize transition-all duration-300 ${
                      todo.done ? "text-gray-400 line-through" : "text-gray-700"
                    }`}
                  >
                    {todo.text}
                  </span>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  {todo.remindAt && !todo.done && (
                    <span className="text-xs" title="Tiene recordatorio">
                      ⏰
                    </span>
                  )}
                  {total > 0 && (
                    <span className="text-[10px] text-gray-400 tabular-nums">
                      {completed}/{total}
                    </span>
                  )}
                  <motion.button
                    type="button"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    onClick={() => toggleExpanded(todo.id)}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Mostrar microobjetivos"
                    aria-expanded={isOpen}
                    title="Microobjetivos"
                  >
                    <motion.div
                      className="h-4 w-4"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <ChevronDownIcon />
                    </motion.div>
                  </motion.button>
                  <motion.button
                    type="button"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    onClick={() => deleteTodo(todo)}
                    whileTap={{ scale: 0.85 }}
                    aria-label="Eliminar tarea"
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4">
                      <path
                        d="M5 5l10 10M15 5L5 15"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </svg>
                  </motion.button>
                </div>
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="items"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <TodoItems todo={todo} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <AnimatePresence>
        {showCompletedModal && (
          <CompleteTodoModal
            todoId={todoCompleted}
            onClose={() => setShowCompletedModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
