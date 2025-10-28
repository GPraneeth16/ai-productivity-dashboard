import { useState } from "react";
import { Bot, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition transform hover:scale-110"
        >
          <Bot size={24} />
        </button>
      )}

      {/* Expandable Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 w-80 h-96 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Bot size={18} className="text-purple-600" /> AI Assistant
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm text-gray-700">
              <div className="bg-gray-100 p-2 rounded-lg self-start max-w-[80%]">
                Hello 👋, I’m your AI assistant. Ask me anything!
              </div>
              {/* Example placeholder messages */}
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition">
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
