import { useState } from "react";
import { ActionBar } from "./components/actionBar";
import TodoForm from "./components/todoForm";
import TodoList from "./components/todoList";
import { VITE_PASSWORD } from "./constants/credentials";
import db from "./lib/db";

export default function App() {
  // Read Data
  const { isLoading, error, data } = db.useQuery({ todos: { items: {} } });
  const [password, setPassword] = useState<string>("");

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

  if (!password || password !== VITE_PASSWORD) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-lg">Desbloquear Sitio</h1>
        <div>
          <input
            type="password"
            value={password}
            className="rounded-lg border border-gray-400 px-4 py-2 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-4 font-mono">
      <h2 className="text-3xl tracking-wide text-gray-700/60">Tareas</h2>
      <div className="w-full max-w-xl border border-gray-300">
        <TodoForm todos={todos} />
        <TodoList todos={todos} />
        <ActionBar todos={todos} />
      </div>
    </div>
  );
}
