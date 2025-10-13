import React from "react";

export default function DatasetSelector() {
  return (
    <div>
      <h2>Dataset</h2>
      <div>
        <label>
          <input type="radio" name="dataset" defaultChecked />
          MNIST (Default)
        </label>
        <label>
          <input type="radio" name="dataset" />
          Upload Custom Dataset
        </label>
      </div>
    </div>
  );
}