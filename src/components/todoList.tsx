import { useState } from "react";
import type { Todo } from "../type/todo.type";
import { deleteTodo, toggleDone } from "../utils/db.functions";
import ChevronDownIcon from "./ui/chevronDownIcon";
import TodoItems from "./todoItems";

export default function TodoList({ todos }: { todos: Todo[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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

  return (
    <div className="divide-y divide-gray-300">
      {todos.map((todo) => {
        const isOpen = expanded.has(todo.id);
        const total = todo.items.length;
        const completed = todo.items.filter((item) => item.done).length;
        return (
          <div key={todo.id}>
            <div className="flex items-center h-10">
              <div className="h-full px-2 flex items-center justify-center border-r border-gray-300">
                <div className="w-5 h-5 flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={todo.done}
                    onChange={() => toggleDone(todo)}
                  />
                </div>
              </div>
              <div className="flex-1 px-2 overflow-hidden flex items-center">
                {todo.done ? (
                  <span className="line-through">{todo.text}</span>
                ) : (
                  <span className="text-xs">{todo.text}</span>
                )}
              </div>
              <button
                className="h-full px-2 flex items-center justify-center gap-1 text-gray-400 hover:text-gray-600 border-l border-l-gray-300"
                onClick={() => toggleExpanded(todo.id)}
                aria-label="Mostrar microobjetivos"
                aria-expanded={isOpen}
                title="Microobjetivos"
              >
                {total > 0 && (
                  <span className="text-[10px] tabular-nums">
                    {completed}/{total}
                  </span>
                )}
                <span
                  className={`w-4 h-4 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                >
                  <ChevronDownIcon />
                </span>
              </button>
              <button
                className="h-full px-2 flex items-center justify-center text-gray-300 hover:text-gray-500 border-l border-l-gray-300"
                onClick={() => deleteTodo(todo)}
              >
                X
              </button>
            </div>
            {isOpen && <TodoItems todo={todo} />}
          </div>
        );
      })}
    </div>
  );
}
