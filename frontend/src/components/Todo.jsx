import { useState, useEffect } from "react";
import { Trash2, Edit3, Save, X, CheckSquare } from "lucide-react";

const API_URL = "http://localhost:5000";

export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("Work");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("All");

  // Fetch todos
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_URL}/todos`);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Error fetching todos:", err);
    }
  };

  // Add new todo
  const addTodo = async () => {
    if (!text.trim()) return;
    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, dueDate, category }),
      });
      const data = await res.json();
      setTodos([...todos, data]);
      setText("");
      setDueDate("");
      setCategory("Work");
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
      setTodos(todos.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  // Toggle completion
  const toggleComplete = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      const updated = await res.json();
      setTodos(todos.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  // Edit handlers
  const startEdit = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText }),
      });
      const updated = await res.json();
      setTodos(todos.map((t) => (t._id === id ? updated : t)));
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Error saving edit:", err);
    }
  };

  const filteredTodos =
    filter === "All" ? todos : todos.filter((t) => t.category === filter);

  const completedCount = todos.filter((t) => t.completed).length;
  const progress =
    todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 tracking-tight">
            My Productivity Hub
          </h1>
          <p className="text-gray-500 text-sm">
            Stay focused. Track progress. Get things done.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">
                {completedCount} / {todos.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Add Todo */}
          <div className="flex flex-col md:flex-row gap-3 mb-6 justify-center">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter task..."
              className="px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none flex-1"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
            >
              <option>Work</option>
              <option>Personal</option>
              <option>Study</option>
              <option>Other</option>
            </select>
            <button
              onClick={addTodo}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
            >
              Add
            </button>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {["All", "Work", "Personal", "Study", "Other"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Todo List */}
          <ul className="space-y-3 max-w-2xl mx-auto">
            {filteredTodos.map((todo) => (
              <li
                key={todo._id}
                className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleComplete(todo._id, todo.completed)}>
                    <CheckSquare
                      className={`${
                        todo.completed ? "text-green-500" : "text-gray-400"
                      }`}
                    />
                  </button>

                  {editingId === todo._id ? (
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="bg-gray-100 px-2 py-1 rounded outline-none border border-gray-300"
                    />
                  ) : (
                    <span
                      className={`${
                        todo.completed ? "line-through text-gray-400" : "text-gray-800"
                      }`}
                    >
                      {todo.text}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingId === todo._id ? (
                    <>
                      <button
                        onClick={() => saveEdit(todo._id)}
                        className="text-green-500 hover:text-green-400"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(todo._id, todo.text)}
                        className="text-yellow-500 hover:text-yellow-400"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo._id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {filteredTodos.length === 0 && (
            <p className="text-center text-gray-400 mt-6">No tasks yet. Add one!</p>
          )}
        </div>
      </div>
    </div>
  );
}
