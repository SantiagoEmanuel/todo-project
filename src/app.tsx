import { useState } from "react";
import { ActionBar } from "./components/actionBar";
import ReminderControls from "./components/reminderControls";
import TodoForm from "./components/todoForm";
import TodoList from "./components/todoList";
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-2">
        <div className="animated-spin rounded-full border border-gray-700 border-b-transparent"></div>
        <p>Cargando</p>
      </div>
    );
  }
  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }
  const { todos } = data;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-4 font-mono">
      <h2 className="text-3xl tracking-wide text-gray-700/60">Tareas</h2>
      <div className="w-full max-w-xl border border-gray-300">
        <TodoForm todos={todos} />
        <TodoList todos={todos} />
        <ActionBar todos={todos} />
        <ReminderControls
          intervalMin={intervalMin}
          onIntervalChange={handleIntervalChange}
        />
      </div>
    </div>
  );
}
