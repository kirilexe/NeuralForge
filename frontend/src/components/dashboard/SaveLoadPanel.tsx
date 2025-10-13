import React from "react";

export default function SaveLoadPanel() {
  return (
    <div>
      <h2>Save & Load</h2>
      <div>
        <label>
          Model Name
          <input type="text" placeholder="e.g., MyFirstCNN" />
        </label>
        <button>Save</button>
      </div>
    </div>
  );
}