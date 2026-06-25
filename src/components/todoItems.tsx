import type { Todo } from "../type/todo.type";
import { addItem, deleteItem, toggleItem } from "../utils/db.functions";

export default function TodoItems({ todo }: { todo: Todo }) {
  const items = [...todo.items].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
  );

  return (
    <div className="bg-gray-50 border-t border-gray-200 pl-9">
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="flex items-center h-8">
            <div className="h-full px-2 flex items-center justify-center">
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={item.done}
                onChange={() => toggleItem(item)}
              />
            </div>
            <div className="flex-1 px-2 overflow-hidden flex items-center">
              {item.done ? (
                <span className="line-through text-xs text-gray-400 capitalize">
                  {item.text}
                </span>
              ) : (
                <span className="text-xs capitalize">{item.text}</span>
              )}
            </div>
            <button
              className="h-full px-2 flex items-center justify-center text-gray-300 hover:text-gray-500"
              onClick={() => deleteItem(item)}
              aria-label="Eliminar microobjetivo"
            >
              X
            </button>
          </div>
        ))}
      </div>
      <form
        className="flex items-center h-8 border-t border-gray-200"
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
          className="h-full flex-1 outline-hidden px-2 bg-transparent text-xs capitalize"
          placeholder="+ Agregar sub-tarea"
          type="text"
          name="item"
        />
      </form>
    </div>
  );
}
