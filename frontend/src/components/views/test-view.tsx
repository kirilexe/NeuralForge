import React from "react";

export default function TestView() {
  return (
    <div>
      <h1>Test</h1>
      <div>
        <h2>Test Results</h2>
        <p>Final performance metrics of your trained model.</p>
        <div style={{ display: "flex", gap: "2rem" }}>
          <div>
            <h3>Accuracy</h3>
            <p>78.53%</p>
          </div>
          <div>
            <h3>Loss</h3>
            <p>0.5359</p>
          </div>
        </div>
        <button>Generate Explainable Insights</button>
      </div>
    </div>
  );
}