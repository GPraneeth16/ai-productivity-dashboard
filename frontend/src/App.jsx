import { useEffect, useState } from "react";
import { Trash2, Edit3, Save, X, CheckCircle2, Circle, AlertCircle, Plus, Calendar, Flag, Folder, StickyNote, Activity, Target, LogOut, User, Settings, BarChart3, Moon, Sun, Search, Download } from "lucide-react";
const API_URL = "http://localhost:5000";

function App() {
  // Auth state
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });

  // UI state
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard', 'stats', 'settings'
  const [searchQuery, setSearchQuery] = useState("");

  // Data state
  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Todo form states
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("Work");
  const [priority, setPriority] = useState("Medium");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState("");

  // Input states
  const [goalInput, setGoalInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [habitInput, setHabitInput] = useState("");

  

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Fetch user data
  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const userRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) throw new Error("Session expired");
      const userData = await userRes.json();
      setUser(userData);

      // Fetch all data in parallel
      const [todosRes, goalsRes, notesRes, habitsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/todos`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/goals`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/notes`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/habits`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setTodos(await todosRes.json());
      setGoals(await goalsRes.json());
      setNotes(await notesRes.json());
      setHabits(await habitsRes.json());
      setStats(await statsRes.json());
      
      setError(null);
    } catch (err) {
      setError(err.message);
      if (err.message === "Session expired") {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Auth functions
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthForm({ name: "", email: "", password: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setTodos([]);
    setGoals([]);
    setNotes([]);
    setHabits([]);
  };

  // Todo functions
  const addTodo = async () => {
    if (!text.trim()) return;
    
    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text, dueDate, category, priority }),
      });
      
      if (!res.ok) throw new Error("Failed to add todo");
      
      const newTodo = await res.json();
      setTodos([...todos, newTodo]);
      setText("");
      setDueDate("");
      setCategory("Work");
      setPriority("Medium");
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete todo");
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleCompleted = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !completed }),
      });
      
      if (!res.ok) throw new Error("Failed to update todo");
      const updated = await res.json();
      setTodos(todos.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditText(todo.text);
    setEditDueDate(todo.dueDate || "");
    setEditCategory(todo.category);
    setEditPriority(todo.priority);
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          text: editText,
          dueDate: editDueDate,
          category: editCategory,
          priority: editPriority
        }),
      });
      
      if (!res.ok) throw new Error("Failed to update todo");
      const updated = await res.json();
      setTodos(todos.map((t) => (t._id === id ? updated : t)));
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // Goal functions
  const addGoal = async () => {
    if (!goalInput.trim()) return;
    try {
      const res = await fetch(`${API_URL}/goals`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: goalInput }),
      });
      const newGoal = await res.json();
      setGoals([...goals, newGoal]);
      setGoalInput("");
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleGoal = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/goals/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !completed }),
      });
      const updated = await res.json();
      setGoals(goals.map((g) => g._id === id ? updated : g));
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteGoal = async (id) => {
    try {
      await fetch(`${API_URL}/goals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(goals.filter((g) => g._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Note functions
  const addNote = async () => {
    if (!noteInput.trim()) return;
    try {
      const res = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: noteInput }),
      });
      const newNote = await res.json();
      setNotes([newNote, ...notes]);
      setNoteInput("");
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${API_URL}/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter((n) => n._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Habit functions
  const addHabit = async () => {
    if (!habitInput.trim()) return;
    try {
      const res = await fetch(`${API_URL}/habits`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: habitInput }),
      });
      const newHabit = await res.json();
      setHabits([...habits, newHabit]);
      setHabitInput("");
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleHabit = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/habits/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !completed }),
      });
      const updated = await res.json();
      setHabits(habits.map((h) => h._id === id ? updated : h));
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteHabit = async (id) => {
    try {
      await fetch(`${API_URL}/habits/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setHabits(habits.filter((h) => h._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Export data
  const exportData = () => {
    const data = {
      todos,
      goals,
      notes,
      habits,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productivity-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const isOverdue = (dueDate, completed) => {
    if (!dueDate || completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
  };

  const filteredTodos = todos
    .filter(t => selectedCategory === "All" || t.category === selectedCategory)
    .filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()));

  const completedCount = todos.filter((t) => t.completed).length;
  const totalTasks = todos.length;

  // Login/Signup Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">PD</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Productivity Dashboard</h1>
            <p className="text-gray-600 mt-2">Organize your life, one task at a time</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                authMode === "login"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                authMode === "signup"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {authMode === "login" ? "Login" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              className="text-indigo-600 font-medium hover:underline"
            >
              {authMode === "login" ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">Loading your workspace...</div>
        </div>
      </div>
    );
  }

  // Statistics View
  if (currentView === "stats" && stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <button onClick={handleLogout} className="text-gray-600 dark:text-gray-400 hover:text-red-600">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Statistics & Analytics</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tasks</h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.todos.total}</div>
              <div className="text-sm text-green-600">{stats.todos.completionRate}% completed</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Goals</h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.goals.total}</div>
              <div className="text-sm text-green-600">{stats.goals.completionRate}% completed</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Habits</h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.habits.total}</div>
              <div className="text-sm text-green-600">{stats.habits.completionRate}% completed</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Notes</h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.notes.total}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tasks by Category</h3>
              <div className="space-y-3">
                {stats.categoryBreakdown.map(cat => (
                  <div key={cat._id} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{cat._id}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tasks by Priority</h3>
              <div className="space-y-3">
                {stats.priorityBreakdown.map(pri => (
                  <div key={pri._id} className="flex items-center justify-between">
                    <span className={`${
                      pri._id === 'High' ? 'text-red-600' :
                      pri._id === 'Medium' ? 'text-amber-600' : 'text-green-600'
                    }`}>{pri._id}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{pri.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Settings View
  if (currentView === "settings") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <button onClick={handleLogout} className="text-gray-600 dark:text-gray-400 hover:text-red-600">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y dark:divide-gray-700">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <div className="text-gray-900 dark:text-white">{user?.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <div className="text-gray-900 dark:text-white">{user?.email}</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Dark Mode</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Use dark theme</div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    darkMode ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      darkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Download size={16} />
                Export All Data
              </button>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PD</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Productivity Dashboard</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back, {user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setCurrentView("stats")}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <BarChart3 size={20} />
              </button>
              <button
                onClick={() => setCurrentView("settings")}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 rounded-lg"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasks}</span>
                  <Folder className="text-gray-400" size={20} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Tasks</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">{completedCount}</span>
                  <CheckCircle2 className="text-green-400" size={20} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-amber-600">{totalTasks - completedCount}</span>
                  <Activity className="text-amber-400" size={20} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pending</p>
              </div>
            </div>

            {/* Task Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Manager</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Add Task */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <input
                    type="text"
                    placeholder="What needs to be done?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  
                  <div className="grid grid-cols-4 gap-3">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option>Work</option>
                      <option>Personal</option>
                      <option>Study</option>
                      <option>Other</option>
                    </select>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <button
                      onClick={addTodo}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {["All", "Work", "Personal", "Study", "Other"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                        selectedCategory === cat
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Task List */}
                <div className="space-y-2">
                  {filteredTodos.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Circle size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No tasks found</p>
                    </div>
                  ) : (
                    filteredTodos.map((todo) => (
                      <div
                        key={todo._id}
                        className={`group border rounded-lg p-4 transition hover:shadow-sm ${
                          isOverdue(todo.dueDate, todo.completed)
                            ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                            : todo.completed
                            ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        }`}
                      >
                        {editingId === todo._id ? (
                          <div className="space-y-3">
                            <input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="date"
                                value={editDueDate}
                                onChange={(e) => setEditDueDate(e.target.value)}
                                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                <option>Work</option>
                                <option>Personal</option>
                                <option>Study</option>
                                <option>Other</option>
                              </select>
                              <select
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value)}
                                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(todo._id)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleCompleted(todo._id, todo.completed)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              {todo.completed ? (
                                <CheckCircle2 size={20} className="text-green-500" />
                              ) : (
                                <Circle size={20} className="text-gray-300 dark:text-gray-600 hover:text-gray-400" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${todo.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"}`}>
                                {todo.text}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {todo.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(todo.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Folder size={12} />
                                  {todo.category}
                                </span>
                                <span className={`flex items-center gap-1 ${
                                  todo.priority === 'High' ? 'text-red-600' :
                                  todo.priority === 'Medium' ? 'text-amber-600' : 'text-green-600'
                                }`}>
                                  <Flag size={12} />
                                  {todo.priority}
                                </span>
                                {isOverdue(todo.dueDate, todo.completed) && (
                                  <span className="text-red-600 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Overdue
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => startEdit(todo)}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => deleteTodo(todo._id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Goals, Habits, Notes */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Daily Goals */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Target size={16} className="text-indigo-600" />
                    Daily Goals
                  </h3>
                  <span className="text-xs text-gray-500">{goals.filter(g => g.completed).length}/{goals.length}</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <input
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Add a goal..."
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                  />
                  <button
                    onClick={addGoal}
                    className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {goals.map((g) => (
                    <div
                      key={g._id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded group"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={g.completed}
                          onChange={() => toggleGoal(g._id, g.completed)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm ${g.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}`}>
                          {g.text}
                        </span>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600"
                        onClick={() => deleteGoal(g._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Habit Tracker */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity size={16} className="text-green-600" />
                  Habits
                </h3>
              </div>
              
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <input
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="New habit..."
                    value={habitInput}
                    onChange={(e) => setHabitInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                  />
                  <button
                    onClick={addHabit}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {habits.map((h) => (
                    <button
                      key={h._id}
                      onClick={() => toggleHabit(h._id, h.completed)}
                      className={`p-3 rounded-lg text-left text-sm font-medium transition border-2 ${
                        h.completed
                          ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400"
                          : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="truncate">{h.name}</span>
                        {h.completed && <CheckCircle2 size={14} />}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHabit(h._id);
                        }}
                        className="opacity-0 hover:opacity-100 text-xs text-red-600"
                      >
                        Delete
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <StickyNote size={16} className="text-amber-600" />
                  Notes
                </h3>
              </div>
              
              <div className="p-4">
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows="3"
                  placeholder="Quick note..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                />
                <button
                  onClick={addNote}
                  className="w-full px-4 py-2 bg-amber-500 text-white rounded text-sm font-medium hover:bg-amber-600"
                >
                  Save Note
                </button>

                <div className="space-y-2 mt-3 max-h-48 overflow-y-auto">
                  {notes.map((n) => (
                    <div
                      key={n._id}
                      className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg group relative"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300 pr-6">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                      <button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600"
                        onClick={() => deleteNote(n._id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 