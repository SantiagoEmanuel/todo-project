import { motion } from "motion/react";

// Botón flotante de acceso rápido: lleva el foco al input de nueva tarea
// desde cualquier punto del scroll, para agregar tareas en un toque.
export default function Fab({ targetId }: { targetId: string }) {
  const handleClick = () => {
    const el = document.getElementById(targetId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    (el as HTMLInputElement | null)?.focus();
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label="Agregar tarea"
      title="Agregar tarea"
      className="fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-20 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#863bff] text-white shadow-lg shadow-[#863bff]/40"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.2 }}
      whileHover={{ scale: 1.08, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7">
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </motion.button>
  );
}
