import type { Todo } from "../types/todo.type";
import { deleteCompleted } from "../utils/db.functions";

export function ActionBar({ todos }: { todos: Todo[] }) {
  return (
    <div className="flex h-10 items-center justify-between border-t border-gray-300 px-2 text-xs">
      <div>Pendientes: {todos.filter((todo) => !todo.done).length}</div>
      <button
        disabled={todos.filter((todo) => !todo.done).length !== 0}
        className={`cursor-pointer text-gray-500 hover:text-gray-700 disabled:text-gray-300`}
        onClick={() => deleteCompleted(todos)}
      >
        Eliminar completados
      </button>
    </div>
  );
}
