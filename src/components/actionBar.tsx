import type { Todo } from "../type/todo.type";
import { deleteCompleted } from "../utils/db.functions";

export function ActionBar({ todos }: { todos: Todo[] }) {
  return (
    <div className="flex justify-between items-center h-10 px-2 text-xs border-t border-gray-300">
      <div>Pendientes: {todos.filter((todo) => !todo.done).length}</div>
      <button
        disabled={todos.filter((todo) => !todo.done).length !== 0}
        className={`disabled:text-gray-300 hover:text-gray-700 text-gray-500 cursor-pointer`}
        onClick={() => deleteCompleted(todos)}
      >
        Eliminar completados
      </button>
    </div>
  );
}
