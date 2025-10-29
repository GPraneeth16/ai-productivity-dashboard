// backend/server.js - COMPLETE CODE WITH AUTHENTICATION
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://ai-productivity-dashboard-five.vercel.app'],
  credentials: true
}));

app.use(express.json());

// MongoDB Atlas Connection
const MONGODB_URI = "mongodb+srv://jonathan:punk@cluster0.we6tyfb.mongodb.net/todoDB?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET = "your-secret-key-change-this-in-production";

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB Atlas Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.log("\n🔍 Troubleshooting:");
    console.log("1. Make sure you've added 0.0.0.0/0 to Network Access whitelist");
    console.log("2. Verify your username is 'jonathan' and password is 'punk'");
    console.log("3. Wait 2-3 minutes if you just created the cluster");
    process.exit(1);
  }
};

connectDB();

// ============ SCHEMAS ============

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);

// Todo Schema (with user reference)
const TodoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  dueDate: { type: String, default: null },
  category: { type: String, default: "Work", enum: ["Work", "Personal", "Study", "Other"] },
  priority: { type: String, default: "Medium", enum: ["High", "Medium", "Low"] },
  completed: { type: Boolean, default: false },
  tags: [String],
}, { timestamps: true });

const Todo = mongoose.model("Todo", TodoSchema);

// Goals Schema
const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Goal = mongoose.model("Goal", GoalSchema);

// Notes Schema
const NoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model("Note", NoteSchema);

// Habits Schema
const HabitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  streak: { type: Number, default: 0 },
  lastCompleted: { type: Date }
});

const Habit = mongoose.model("Habit", HabitSchema);

// ============ MIDDLEWARE ============

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ============ AUTH ROUTES ============

// Register
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get Current User
app.get("/auth/me", authMiddleware, async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar
  });
});

// Update Profile
app.patch("/auth/profile", authMiddleware, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ============ TODO ROUTES (Protected) ============

app.get("/todos", authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.userId }).sort({ dueDate: 1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/todos", authMiddleware, async (req, res) => {
  try {
    const { text, dueDate, category, priority, tags } = req.body;
    
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Task text is required" });
    }

    const newTodo = new Todo({
      userId: req.userId,
      text: text.trim(),
      dueDate: dueDate || null,
      category: category || "Work",
      priority: priority || "Medium",
      tags: tags || [],
      completed: false,
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

app.patch("/todos/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const updated = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update todo" });
  }
});

app.delete("/todos/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Todo.findOneAndDelete({ _id: id, userId: req.userId });

    if (!deleted) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// ============ GOALS ROUTES ============

app.get("/goals", authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

app.post("/goals", authMiddleware, async (req, res) => {
  try {
    const goal = new Goal({
      userId: req.userId,
      text: req.body.text,
      completed: false
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: "Failed to create goal" });
  }
});

app.patch("/goals/:id", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: "Failed to update goal" });
  }
});

app.delete("/goals/:id", authMiddleware, async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

// ============ NOTES ROUTES ============

app.get("/notes", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

app.post("/notes", authMiddleware, async (req, res) => {
  try {
    const note = new Note({
      userId: req.userId,
      text: req.body.text
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: "Failed to create note" });
  }
});

app.delete("/notes/:id", authMiddleware, async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// ============ HABITS ROUTES ============

app.get("/habits", authMiddleware, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch habits" });
  }
});

app.post("/habits", authMiddleware, async (req, res) => {
  try {
    const habit = new Habit({
      userId: req.userId,
      name: req.body.name,
      completed: false,
      streak: 0
    });
    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ error: "Failed to create habit" });
  }
});

app.patch("/habits/:id", authMiddleware, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: "Failed to update habit" });
  }
});

app.delete("/habits/:id", authMiddleware, async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Habit deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete habit" });
  }
});

// ============ STATISTICS ROUTE ============

app.get("/stats", authMiddleware, async (req, res) => {
  try {
    const totalTodos = await Todo.countDocuments({ userId: req.userId });
    const completedTodos = await Todo.countDocuments({ userId: req.userId, completed: true });
    const totalGoals = await Goal.countDocuments({ userId: req.userId });
    const completedGoals = await Goal.countDocuments({ userId: req.userId, completed: true });
    const totalNotes = await Note.countDocuments({ userId: req.userId });
    const totalHabits = await Habit.countDocuments({ userId: req.userId });
    const completedHabits = await Habit.countDocuments({ userId: req.userId, completed: true });

    // Category breakdown
    const categoryBreakdown = await Todo.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Priority breakdown
    const priorityBreakdown = await Todo.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    res.json({
      todos: {
        total: totalTodos,
        completed: completedTodos,
        pending: totalTodos - completedTodos,
        completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0
      },
      goals: {
        total: totalGoals,
        completed: completedGoals,
        completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
      },
      notes: { total: totalNotes },
      habits: {
        total: totalHabits,
        completed: completedHabits,
        completionRate: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0
      },
      categoryBreakdown,
      priorityBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "Server is running",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`🔐 Authentication enabled`);
  console.log(`📊 Full API with user data isolation\n`);
});