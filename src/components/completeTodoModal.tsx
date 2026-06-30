import { motion } from "motion/react";
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
      <div className="flex flex-col items-center gap-4 text-center">
        <motion.span
          className="text-5xl"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 12,
            delay: 0.1,
          }}
        >
          🎉
        </motion.span>
        <h2 className="text-lg font-semibold text-gray-700">
          ¡Felicidades! Completaste todos los microobjetivos.
        </h2>
        <motion.button
          className="w-full cursor-pointer rounded-xl bg-[#863bff] px-4 py-2.5 font-medium text-white shadow-sm shadow-[#863bff]/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            toggleDone({ id: todoId, done: true });
            onClose();
          }}
        >
          Marcar tarea como completada
        </motion.button>
      </div>
    </Modal>
  );
}
