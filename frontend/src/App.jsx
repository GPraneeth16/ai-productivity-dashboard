import { useEffect, useState } from "react";
import { Trash2, Edit3, Save, X, CheckCircle2, Circle, AlertCircle, Plus, Calendar, Flag, Folder, StickyNote, Activity, Target, LogOut, Settings, BarChart3, Moon, Sun, Search, Download, Sparkles, TrendingUp, Zap, Award } from "lucide-react";

const API_URL = "https://dashboard-backend-4whv.onrender.com";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });

  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [currentView, setCurrentView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("Work");
  const [priority, setPriority] = useState("Medium");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState("");

  const [goalInput, setGoalInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [habitInput, setHabitInput] = useState("");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

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
      const userRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) throw new Error("Session expired");
      const userData = await userRes.json();
      setUser(userData);

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
      if (err.message === "Session expired") handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm)
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

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

  const exportData = () => {
    const data = { todos, goals, notes, habits, exportedAt: new Date().toISOString() };
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

  // Login/Signup Screen - Modern Design
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Productivity Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Organize your life, one task at a time</p>
          </div>

          <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                authMode === "login"
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                authMode === "signup"
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              {authMode === "login" ? "Login to Continue" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              className="text-violet-600 dark:text-violet-400 font-medium hover:underline"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">Loading your workspace...</div>
        </div>
      </div>
    );
  }

  // Statistics View
  if (currentView === "stats" && stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-slate-900">
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
              >
                ← Back
              </button>
              <button onClick={handleLogout} className="text-gray-600 dark:text-gray-400 hover:text-red-500">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="text-violet-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track your productivity metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: "Tasks", value: stats.todos.total, rate: stats.todos.completionRate, icon: CheckCircle2, color: "violet" },
              { title: "Goals", value: stats.goals.total, rate: stats.goals.completionRate, icon: Target, color: "blue" },
              { title: "Habits", value: stats.habits.total, rate: stats.habits.completionRate, icon: TrendingUp, color: "green" },
              { title: "Notes", value: stats.notes.total, rate: null, icon: StickyNote, color: "amber" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                    <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</div>
                {stat.rate !== null && (
                  <div className="mt-2 text-sm font-medium text-green-600">{stat.rate}% complete</div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Folder size={18} />
                Tasks by Category
              </h3>
              <div className="space-y-3">
                {stats.categoryBreakdown.map(cat => (
                  <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <span className="text-gray-700 dark:text-gray-300">{cat._id}</span>
                    <span className="font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-3 py-1 rounded-lg">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Flag size={18} />
                Tasks by Priority
              </h3>
              <div className="space-y-3">
                {stats.priorityBreakdown.map(pri => (
                  <div key={pri._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <span className={`font-medium ${
                      pri._id === 'High' ? 'text-red-600' :
                      pri._id === 'Medium' ? 'text-amber-600' : 'text-green-600'
                    }`}>{pri._id}</span>
                    <span className="font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-3 py-1 rounded-lg">{pri.count}</span>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-slate-900">
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
              >
                ← Back
              </button>
              <button onClick={handleLogout} className="text-gray-600 dark:text-gray-400 hover:text-red-500">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Settings className="text-violet-600" />
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account and preferences</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                <h3 className="font-semibold text-gray-900 dark:text-white">Profile Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-900 dark:text-white">{user?.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-900 dark:text-white">{user?.email}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                <h3 className="font-semibold text-gray-900 dark:text-white">Appearance</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="text-violet-600" size={20} /> : <Sun className="text-amber-500" size={20} />}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Dark Mode</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Toggle dark theme</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      darkMode ? "bg-violet-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        darkMode ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                <h3 className="font-semibold text-gray-900 dark:text-white">Data Management</h3>
              </div>
              <div className="p-6">
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Download size={18} />
                  Export All Data
                </button>
              </div>
            </div>

            <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl rounded-2xl border border-red-200/50 dark:border-red-800/50 overflow-hidden">
              <div className="p-6 border-b border-red-200/50 dark:border-red-800/50">
                <h3 className="font-semibold text-red-600">Danger Zone</h3>
              </div>
              <div className="p-6">
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard - Modern Design
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-900">
      {/* Modern Navigation */}
      <nav className="bg-white dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-300 dark:border-gray-800/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Productivity Dashboard</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Hey, {user?.name}! 👋</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setCurrentView("stats")}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <BarChart3 size={20} />
              </button>
              <button
                onClick={() => setCurrentView("settings")}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-red-500 rounded-xl transition-colors"
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
            
            {/* Modern Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total", value: totalTasks, icon: Zap, color: "violet" },
                { label: "Done", value: completedCount, icon: Award, color: "green" },
                { label: "Active", value: totalTasks - completedCount, icon: TrendingUp, color: "amber" }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-900/80 backdrop-blur-xl p-5 rounded-2xl border-2 border-gray-300 dark:border-gray-800/50 hover:shadow-xl hover:scale-105 transition-all duration-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</span>
                    <stat.icon className={`text-${stat.color}-500`} size={18} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Task Manager - Modern Card */}
            <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border-2 border-gray-300 dark:border-gray-800/50 overflow-hidden shadow-md">
              <div className="border-b-2 border-gray-300 dark:border-gray-800/50 px-6 py-4 bg-gray-50 dark:bg-transparent">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="text-violet-600" size={24} />
                    Tasks
                  </h2>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Add Task - Modern Form */}
                <div className="mb-6 p-5 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 rounded-2xl border-2 border-violet-200 dark:border-violet-800/50 shadow-sm">
                  <input
                    type="text"
                    placeholder="What's on your mind?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none shadow-sm"
                  />
                  
                  <div className="grid grid-cols-4 gap-3">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none shadow-sm"
                    />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none shadow-sm"
                    >
                      <option>Work</option>
                      <option>Personal</option>
                      <option>Study</option>
                      <option>Other</option>
                    </select>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none shadow-sm"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <button
                      onClick={addTodo}
                      className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>

                {/* Category Filters - Modern Pills */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {["All", "Work", "Personal", "Study", "Other"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Task List - Modern Cards */}
                <div className="space-y-3">
                  {filteredTodos.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <Circle size={64} className="mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">No tasks yet</p>
                      <p className="text-sm">Add your first task above</p>
                    </div>
                  ) : (
                    filteredTodos.map((todo) => (
                      <div
                        key={todo._id}
                        className={`group border rounded-2xl p-4 transition-all hover:shadow-lg ${
                          isOverdue(todo.dueDate, todo.completed)
                            ? "border-red-300 bg-red-50/80 dark:bg-red-900/20"
                            : todo.completed
                            ? "border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-violet-300 dark:hover:border-violet-700"
                        }`}
                      >
                        {editingId === todo._id ? (
                          <div className="space-y-3">
                            <input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="date"
                                value={editDueDate}
                                onChange={(e) => setEditDueDate(e.target.value)}
                                className="px-3 py-2 border rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="px-3 py-2 border rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                <option>Work</option>
                                <option>Personal</option>
                                <option>Study</option>
                                <option>Other</option>
                              </select>
                              <select
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value)}
                                className="px-3 py-2 border rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(todo._id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 flex items-center gap-1"
                              >
                                <Save size={14} /> Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-xl text-sm hover:bg-gray-400 dark:hover:bg-gray-500 flex items-center gap-1"
                              >
                                <X size={14} /> Cancel
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
                                <CheckCircle2 size={24} className="text-green-500" />
                              ) : (
                                <Circle size={24} className="text-gray-300 dark:text-gray-600 hover:text-violet-500 transition-colors" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <p className={`text-base font-medium ${todo.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"}`}>
                                {todo.text}
                              </p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {todo.dueDate && (
                                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
                                    <Calendar size={12} />
                                    {new Date(todo.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                                  todo.category === 'Work' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                  todo.category === 'Personal' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                  todo.category === 'Study' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                  'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                }`}>
                                  {todo.category}
                                </span>
                                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${
                                  todo.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                  todo.priority === 'Medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                                  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                }`}>
                                  <Flag size={12} />
                                  {todo.priority}
                                </span>
                                {isOverdue(todo.dueDate, todo.completed) && (
                                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-medium">
                                    <AlertCircle size={12} />
                                    Overdue
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEdit(todo)}
                                className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-colors"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => deleteTodo(todo._id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                              >
                                <Trash2 size={16} />
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

          {/* Sidebar - Modern Cards */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Daily Goals */}
            <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border-2 border-gray-300 dark:border-gray-800/50 overflow-hidden shadow-md">
              <div className="border-b-2 border-gray-300 dark:border-gray-800/50 px-5 py-4 bg-gray-50 dark:bg-transparent">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="text-indigo-600" size={20} />
                    Goals
                  </h3>
                  <span className="text-xs font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg">
                    {goals.filter(g => g.completed).length}/{goals.length}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex gap-2 mb-4">
                  <input
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                    placeholder="New goal..."
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                  />
                  <button
                    onClick={addGoal}
                    className="px-3 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {goals.map((g) => (
                    <div
                      key={g._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl group transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={g.completed}
                          onChange={() => toggleGoal(g._id, g.completed)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm ${g.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}`}>
                          {g.text}
                        </span>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                        onClick={() => deleteGoal(g._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Habits */}
            <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border-2 border-gray-300 dark:border-gray-800/50 overflow-hidden shadow-md">
              <div className="border-b-2 border-gray-300 dark:border-gray-800/50 px-5 py-4 bg-gray-50 dark:bg-transparent">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="text-green-600" size={20} />
                  Habits
                </h3>
              </div>
              
              <div className="p-5">
                <div className="flex gap-2 mb-4">
                  <input
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                    placeholder="New habit..."
                    value={habitInput}
                    onChange={(e) => setHabitInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                  />
                  <button
                    onClick={addHabit}
                    className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {habits.map((h) => (
                    <button
                      key={h._id}
                      onClick={() => toggleHabit(h._id, h.completed)}
                      className={`p-3 rounded-xl text-left text-sm font-medium transition-all border-2 ${
                        h.completed
                          ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400 shadow-md"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-300 dark:hover:border-green-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="truncate">{h.name}</span>
                        {h.completed && <CheckCircle2 size={16} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border-2 border-gray-300 dark:border-gray-800/50 overflow-hidden shadow-md">
              <div className="border-b-2 border-gray-300 dark:border-gray-800/50 px-5 py-4 bg-gray-50 dark:bg-transparent">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <StickyNote className="text-amber-600" size={20} />
                  Notes
                </h3>
              </div>
              
              <div className="p-5">
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                  rows="3"
                  placeholder="Quick note..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                />
                <button
                  onClick={addNote}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                >
                  Save Note
                </button>

                <div className="space-y-2 mt-4 max-h-48 overflow-y-auto">
                  {notes.map((n) => (
                    <div
                      key={n._id}
                      className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl group relative border border-amber-200/50 dark:border-amber-800/50"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300 pr-6">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                      <button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
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