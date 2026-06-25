import { ActionBar } from "./components/actionBar";
import TodoForm from "./components/todoForm";
import TodoList from "./components/todoList";
import db from "./lib/db";

export default function App() {
  // Read Data
  const { isLoading, error, data } = db.useQuery({ todos: {} });
  if (isLoading) {
    return;
  }
  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }
  const { todos } = data;
  return (
    <div className="font-mono min-h-screen flex justify-center items-center flex-col space-y-4">
      <h2 className="tracking-wide text-3xl text-gray-700/60">Tareas</h2>
      <div className="border border-gray-300 max-w-xl w-full">
        <TodoForm todos={todos} />
        <TodoList todos={todos} />
        <ActionBar todos={todos} />
      </div>
    </div>
  );
}
