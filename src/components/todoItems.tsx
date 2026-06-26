import type { Todo } from "../types/todo.type";
import { addItem, deleteItem, toggleItem } from "../utils/db.functions";

export default function TodoItems({ todo }: { todo: Todo }) {
  const items = [...todo.items].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
  );

  return (
    <div className="border-t border-gray-200 bg-gray-50 pl-9">
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="flex h-8 items-center">
            <div className="flex h-full items-center justify-center px-2">
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={item.done}
                onChange={() => toggleItem(item)}
              />
            </div>
            <div
              className="flex flex-1 items-center overflow-hidden px-2"
              onClick={() => toggleItem(todo)}
            >
              {item.done ? (
                <span className="text-xs text-gray-400 capitalize line-through">
                  {item.text}
                </span>
              ) : (
                <span className="text-xs text-gray-600 capitalize">
                  {item.text}
                </span>
              )}
            </div>
            <button
              className="flex h-full items-center justify-center px-2 text-gray-300 hover:text-gray-500"
              onClick={() => deleteItem(item)}
              aria-label="Eliminar microobjetivo"
            >
              X
            </button>
          </div>
        ))}
      </div>
      <form
        className="flex h-8 items-center border-t border-gray-200"
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.item as HTMLInputElement;
          const value = input.value.trim();
          if (!value) return;
          addItem(todo.id, value);
          e.currentTarget.reset();
        }}
      >
        <input
          className="h-full flex-1 bg-transparent px-2 text-xs capitalize outline-hidden"
          placeholder="+ Agregar sub-tarea"
          type="text"
          name="item"
        />
      </form>
    </div>
  );
}
