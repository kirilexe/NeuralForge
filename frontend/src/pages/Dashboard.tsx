import React, { useState } from "react";
import BuildView from "../components/views/build-view";
import TrainView from "../components/views/train-view";
import TestView from "../components/views/test-view";

export default function Dashboard() {
  const [tab, setTab] = useState<"build" | "train" | "test">("build");

  return (
    <div>
      <div>
        <button onClick={() => setTab("build")}>Build</button>
        <button onClick={() => setTab("train")}>Train</button>
        <button onClick={() => setTab("test")}>Test</button>
      </div>
      <div>
        <div style={{ display: tab === "build" ? "block" : "none" }}>
          <BuildView />
        </div>
        <div style={{ display: tab === "train" ? "block" : "none" }}>
          <TrainView />
        </div>
        <div style={{ display: tab === "test" ? "block" : "none" }}>
          <TestView />
        </div>
      </div>
    </div>
  );
}