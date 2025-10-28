// backend/server.js - COMPLETE CODE
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// MongoDB Atlas Connection - YOUR CLUSTER
const MONGODB_URI = "mongodb+srv://jonathan:punk@cluster0.we6tyfb.mongodb.net/todoDB?retryWrites=true&w=majority&appName=Cluster0";

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

// MongoDB Schema
const TodoSchema = new mongoose.Schema(
  {
    text: { 
      type: String, 
      required: [true, "Task text is required"],
      trim: true,
      minlength: [1, "Task text cannot be empty"]
    },
    dueDate: { 
      type: String,
      default: null
    },
    category: { 
      type: String, 
      default: "Work",
      enum: ["Work", "Personal", "Study", "Other"]
    },
    priority: { 
      type: String, 
      default: "Medium",
      enum: ["High", "Medium", "Low"]
    },
    completed: { 
      type: Boolean, 
      default: false 
    },
  },
  {
    timestamps: true,
  }
);

const Todo = mongoose.model("Todo", TodoSchema);

// API Routes

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "Server is running",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// Get all todos (sorted by due date)
app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ dueDate: 1 });
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Add new todo
app.post("/todos", async (req, res) => {
  try {
    const { text, dueDate, category, priority } = req.body;
    
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Task text is required" });
    }

    const newTodo = new Todo({
      text: text.trim(),
      dueDate: dueDate || null,
      category: category || "Work",
      priority: priority || "Medium",
      completed: false,
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// Update todo
app.patch("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid todo ID" });
    }

    const updated = await Todo.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Delete todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid todo ID" });
    }

    const deleted = await Todo.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend should be at http://localhost:5173`);
  console.log(`📊 MongoDB Atlas: Cluster0.we6tyfb\n`);
});