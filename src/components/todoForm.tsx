import type { Todo } from "../types/todo.type";
import { addTodo, toggleAll } from "../utils/db.functions";
import ChevronDownIcon from "./ui/chevronDownIcon";

export default function TodoForm({ todos }: { todos: Todo[] }) {
  return (
    <div className="flex h-10 items-center border-b border-gray-300">
      <button
        className="flex h-full items-center justify-center border-r border-gray-300 px-2"
        onClick={() => toggleAll(todos)}
        aria-label="Completar todas las tareas"
        title="Completar todas las tareas pendientes"
      >
        <div className="h-5 w-5">
          <ChevronDownIcon />
        </div>
      </button>
      <form
        className="flex h-full flex-1 items-center justify-between gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          addTodo(e.target.input.value);
          e.currentTarget.reset();
        }}
      >
        <input
          className="h-full bg-transparent px-2 text-sm capitalize outline-hidden"
          autoFocus
          placeholder="¿Qué tareas tienes?"
          type="text"
          name="input"
        />
      </form>
    </div>
  );
}
