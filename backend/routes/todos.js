// routes/todos.js
import express from "express";
import Todo from "../models/Todo.js";

const router = express.Router();

// --- Add Todo ---
router.post("/api/todos", async (req, res) => {
  try {
    const newTodo = new Todo(req.body);
    await newTodo.save();
    res.json(newTodo);
  } catch (err) {
    res.status(500).json({ error: "Failed to add todo" });
  }
});

// --- Delete Todo ---
router.delete("/api/todos/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// --- PATCH (Partial Update) ---
router.patch("/api/todos/:id", async (req, res) => {
  try {
    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update todo" });
  }
});

export default router;
