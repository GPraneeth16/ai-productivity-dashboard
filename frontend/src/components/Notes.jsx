import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Notebook, Trash2, Edit2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Notes() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("notes");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!input.trim()) return;
    setNotes([...notes, input]);
    setInput("");
  };

  const deleteNote = (index) => {
    setNotes(notes.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingText("");
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingText(notes[index]);
  };

  const saveEdit = (index) => {
    const updated = [...notes];
    updated[index] = editingText;
    setNotes(updated);
    setEditingIndex(null);
    setEditingText("");
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md p-5 w-full max-w-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Notebook className="text-purple-600" /> Notes
      </h2>

      {/* Add Note */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Write a note..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          onClick={addNote}
          className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition"
        >
          Add
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {notes.map((note, index) => (
          <motion.div
            key={index}
            className="group relative flex flex-col bg-gray-50 p-3 rounded-xl shadow-sm hover:shadow-md transition"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-gray-700">Note {index + 1}</span>

              {/* Edit/Delete buttons only on hover */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition absolute top-2 right-2">
                {editingIndex === index ? (
                  <button
                    onClick={() => saveEdit(index)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Check size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => startEditing(index)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit2 size={18} />
                  </button>
                )}
                <button
                  onClick={() => deleteNote(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {editingIndex === index ? (
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="w-full h-20 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            ) : (
              <div className="prose prose-sm bg-gray-50 p-2 rounded-lg max-h-28 overflow-y-auto">
                <ReactMarkdown>{note}</ReactMarkdown>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
