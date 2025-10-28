// models/Todo.js
import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
  category: { type: String, default: "Work" },
});

export default mongoose.model("Todo", TodoSchema);
