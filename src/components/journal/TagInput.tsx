import React, { useState } from "react";
import { X, Plus } from "lucide-react";

export default function TagInput({ tags = [], onChange }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput("");
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2 font-sans">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF8E7] text-[#6F4E37] text-xs font-bold border border-[#6F4E37]/10"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-[#7A6F62] hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type tag name and click +..."
          className="flex-1 bg-white border border-[#6F4E37]/15 rounded-xl px-4 py-2.5 text-xs placeholder-[#7A6F62]/50 text-[#2E2E2E] focus:outline-none focus:border-[#6F4E37]"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim()}
          className="px-4.5 py-2.5 rounded-xl bg-[#FFF8E7] text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white transition disabled:opacity-35"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
