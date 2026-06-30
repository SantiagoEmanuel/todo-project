import { motion } from "motion/react";
import { useState } from "react";
import { ActionBar } from "./components/actionBar";
import ReminderControls from "./components/reminderControls";
import TodoForm from "./components/todoForm";
import TodoList from "./components/todoList";
import Fab from "./components/ui/fab";
import db from "./lib/db";
import { updatePushInterval } from "./lib/push";
import { getIntervalMin, setStoredIntervalMin } from "./lib/reminders";
import { useReminders } from "./lib/useReminders";
import { useTaskReminders } from "./lib/useTaskReminders";

export default function App() {
  // Read Data
  const { isLoading, error, data } = db.useQuery({ todos: { items: {} } });
  const [intervalMin, setIntervalMin] = useState(getIntervalMin());

  useReminders(data?.todos, intervalMin);
  useTaskReminders(data?.todos);

  const handleIntervalChange = (min: number) => {
    setIntervalMin(min);
    setStoredIntervalMin(min);
    void updatePushInterval(min);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-white to-gray-50">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-[#863bff] border-b-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-sm text-gray-400">Cargando…</p>
      </div>
    );
  }
  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }
  const { todos } = data;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center space-y-6 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 p-4 font-mono">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-[#863bff]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-32 h-72 w-72 rounded-full bg-[#47bfff]/10 blur-3xl"
      />
      <motion.h2
        className="text-3xl tracking-wide text-gray-700/70"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Tareas
      </motion.h2>
      <motion.div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <TodoForm todos={todos} />
        <TodoList todos={todos} />
        <ActionBar todos={todos} />
        <ReminderControls
          intervalMin={intervalMin}
          onIntervalChange={handleIntervalChange}
        />
      </motion.div>
      <Fab targetId="new-todo-input" />
    </div>
  );
}
