import { useEffect, useState } from "react";
import type { Todo } from "../types/todo.type";
import { deleteTodo, toggleDone } from "../utils/db.functions";
import CompleteTodoModal from "./completeTodoModal";
import TodoItems from "./todoItems";
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

  return (
    <div className="divide-y divide-gray-300">
      {todos.map((todo) => {
        const isOpen = expanded.has(todo.id);
        const total = todo.items.length;
        const completed = todo.items.filter((item) => item.done).length;
        if (completed === total && total > 0) {
          setTodoCompleted(todo.id);
        }
        return (
          <div key={todo.id}>
            <div className="flex h-10 items-center">
              <div className="flex h-full items-center justify-center border-r border-gray-300 px-2">
                <div className="flex h-5 w-5 items-center justify-center">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={todo.done}
                    onChange={() => toggleDone(todo)}
                  />
                </div>
              </div>
              <div className="flex flex-1 items-center overflow-hidden px-2 capitalize">
                {todo.done ? (
                  <span className="text-xs text-gray-400 capitalize line-through">
                    {todo.text}
                  </span>
                ) : (
                  <span className="text-xs text-gray-600 capitalize">
                    {todo.text}
                  </span>
                )}
              </div>
              <button
                className="flex h-full items-center justify-center gap-1 border-l border-l-gray-300 px-2 text-gray-400 hover:text-gray-600"
                onClick={() => toggleExpanded(todo.id)}
                aria-label="Mostrar microobjetivos"
                aria-expanded={isOpen}
                title="Microobjetivos"
              >
                {todo.remindAt && !todo.done && (
                  <span title="Tiene recordatorio">⏰</span>
                )}
                {total > 0 && (
                  <span className="text-[10px] tabular-nums">
                    {completed}/{total}
                  </span>
                )}
                <span
                  className={`h-4 w-4 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                >
                  <ChevronDownIcon />
                </span>
              </button>
              <button
                className="flex h-full items-center justify-center border-l border-l-gray-300 px-2 text-gray-300 hover:text-gray-500"
                onClick={() => deleteTodo(todo)}
              >
                X
              </button>
            </div>
            {isOpen && <TodoItems todo={todo} />}
          </div>
        );
      })}
      {showCompletedModal && (
        <CompleteTodoModal
          todoId={todoCompleted}
          onClose={() => setShowCompletedModal(false)}
        />
      )}
    </div>
  );
}
