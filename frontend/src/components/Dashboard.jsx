import Notes from "./Notes";
import { Chart } from "./Chart"; // assuming you have a Chart component
import { AiOutlineRobot } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-6">
            <span className="text-lg font-medium text-gray-700">Notes</span>
            <span className="text-lg font-medium text-gray-700 flex items-center gap-1">
              <AiOutlineRobot size={18} /> AI Text
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes Block */}
        <div className="w-full">
          <Notes />
        </div>

        {/* Chart Block */}
        <div className="w-full">
          <div className="bg-white p-5 rounded-2xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Your Chart</h2>
            <Chart />
          </div>
        </div>
      </main>
    </div>
  );
}
