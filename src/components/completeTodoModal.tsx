import { toggleDone } from "../utils/db.functions";
import Modal from "./ui/modal";

export default function CompleteTodoModal({
  todoId,
  onClose,
}: {
  todoId: string;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center justify-center gap-4">
        <h2 className="text-lg font-semibold text-gray-700">
          ¡Felicidades!, se completó la tarea.
        </h2>
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => {
            toggleDone({ id: todoId, done: true });
            onClose();
          }}
        >
          ¡Marcar como completada!
        </button>
      </div>
    </Modal>
  );
}
