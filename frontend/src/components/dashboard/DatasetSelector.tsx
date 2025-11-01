import React from "react";

export default function DatasetSelector() {
  return (
    <div>
      <h2>Dataset</h2>
      <div className="w-full p-4 bg-[#1e293b] rounded-md border border-[#374151] shadow-2xl">
        <label>
          <input className="m-1" type="radio" name="dataset" defaultChecked />
          MNIST (Default)
        </label>
        <label>
          <input className="m-1" type="radio" name="dataset" />
          Upload Custom Dataset
        </label>
      </div>
    </div>
  );
}