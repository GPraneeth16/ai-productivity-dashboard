import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Activity } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function HabitChart({ todos }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  todos.forEach((todo) => {
    if (todo.completed && todo.dueDate) {
      const dayIndex = new Date(todo.dueDate).getDay();
      counts[dayIndex] += 1;
    }
  });

  const data = {
    labels: days,
    datasets: [
      {
        label: "Habits Completed",
        data: counts,
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderRadius: 8,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Activity className="mr-2 text-indigo-500" /> 📊 Habit Chart
      </h2>
      <Bar data={data} />
    </motion.div>
  );
}
