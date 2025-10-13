import React from "react";

export default function TrainView() {
  return (
    <div>
      <h1>Train</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <h2>Training Configuration</h2>
          <div>
            <label>
              Epochs:
              <input type="number" defaultValue={10} />
            </label>
          </div>
          <div>
            <label>
              Batch Size:
              <input type="number" defaultValue={64} />
            </label>
          </div>
          <div>
            <label>
              Learning Rate:
              <input type="number" step="0.0001" defaultValue={0.001} />
            </label>
          </div>
          <div>
            <label>
              Optimizer:
              <select>
                <option>Adam</option>
                <option>SGD</option>
              </select>
            </label>
          </div>
        </div>
        <div>
          <h2>Training Progress</h2>
          <div>
            <p>Training complete. View results below.</p>
            <div>
              <p>[accuracy/loss chart placeholder]</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}