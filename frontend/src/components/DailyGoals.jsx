import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle } from "lucide-react";

export default function DailyGoals() {
  const [goals, setGoals] = useState([]);
  const [input, setInput] = useState("");

  const addGoal = () => {
    if (!input.trim()) return;
    setGoals([...goals, { text: input, done: false }]);
    setInput("");
  };

  const toggleGoal = (index) => {
    const newGoals = [...goals];
    newGoals[index].done = !newGoals[index].done;
    setGoals(newGoals);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">🎯 Daily Goals</h2>

      <div className="flex mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a goal..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <button
          onClick={addGoal}
          className="ml-3 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {goals.map((goal, i) => (
          <li
            key={i}
            className="flex items-center space-x-3 cursor-pointer bg-gray-50 p-3 rounded-lg"
            onClick={() => toggleGoal(i)}
          >
            {goal.done ? (
              <CheckCircle className="text-green-500" size={20} />
            ) : (
              <Circle className="text-gray-400" size={20} />
            )}
            <span
              className={`${
                goal.done ? "line-through text-gray-400" : "text-gray-700"
              }`}
            >
              {goal.text}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
