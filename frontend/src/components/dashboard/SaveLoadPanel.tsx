import React from "react";

export default function SaveLoadPanel() {
  return (
    <div>
      <h2>Save & Load</h2>
      <div className="w-full p-4 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] shadow-sm transition-all hover:border-purple-500/40">
        <label>
          Model Name
          <input type="text" placeholder="e.g., MyFirstCNN" />
        </label>
        <button>Save</button>
      </div>
    </div>
  );
}