import type { Todo } from "../type/todo.type";
import { addTodo, toggleAll } from "../utils/db.functions";
import ChevronDownIcon from "./ui/chevronDownIcon";

export default function TodoForm({ todos }: { todos: Todo[] }) {
  return (
    <div className="flex items-center h-10 border-b border-gray-300">
      <button
        className="h-full px-2 border-r border-gray-300 flex items-center justify-center"
        onClick={() => toggleAll(todos)}
        aria-label="Completar todas las tareas"
        title="Completar todas las tareas pendientes"
      >
        <div className="w-5 h-5">
          <ChevronDownIcon />
        </div>
      </button>
      <form
        className="flex-1 h-full flex gap-4 items-center justify-between"
        onSubmit={(e) => {
          e.preventDefault();
          addTodo(e.target.input.value);
          e.currentTarget.reset();
        }}
      >
        <input
          className="h-full outline-hidden px-2 bg-transparent text-sm capitalize"
          autoFocus
          placeholder="¿Qué tareas tienes?"
          type="text"
          name="input"
        />
      </form>
    </div>
  );
}
