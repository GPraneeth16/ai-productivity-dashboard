// src/components/Navbar.jsx
import { Bot } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Dashboard title */}
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
          Dashboard
        </h1>

        {/* Right: Top-right items */}
        <div className="flex items-center gap-6">
          <span className="text-lg font-medium text-gray-700 hover:text-purple-600 transition">
            Notes
          </span>
          <span className="text-lg font-medium text-gray-700 flex items-center gap-1 hover:text-indigo-600 transition">
            <Bot size={18} /> AI Text
          </span>
        </div>
      </div>
    </header>
  );
}
