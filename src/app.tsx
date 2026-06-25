import { useEffect, useState } from "react";
import { ActionBar } from "./components/actionBar";
import TodoForm from "./components/todoForm";
import TodoList from "./components/todoList";
import db from "./lib/db";

export default function App() {
  // Read Data
  const { isLoading, error, data } = db.useQuery({ todos: { items: {} } });
  const [password, setPassword] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    if (password === import.meta.env.VITE_PASSWORD) setShow(true);
  }, [password]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center">
        <div className="rounded-full animated-spin border border-b-transparent border-gray-700"></div>
        <p>Cargando</p>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }
  const { todos } = data;

  if (!show) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-lg">Contraseña</h1>
        <div>
          <input
            type="password"
            value={password}
            className="border border-gray-400 rounded-lg outline-none px-4 py-2"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="font-mono min-h-screen flex justify-center items-center flex-col space-y-4 p-4">
      <h2 className="tracking-wide text-3xl text-gray-700/60">Tareas</h2>
      <div className="border border-gray-300 max-w-xl w-full">
        <TodoForm todos={todos} />
        <TodoList todos={todos} />
        <ActionBar todos={todos} />
      </div>
    </div>
  );
}
