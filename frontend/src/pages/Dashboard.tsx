import React, { useState } from "react";
import BuildView from "../components/views/build-view";
import TrainView from "../components/views/train-view";
import TestView from "../components/views/test-view";
import Navbar from "../components/header/Navbar";

export default function Dashboard() {
  const [tab, setTab] = useState<"build" | "train" | "test">("build");

  const handleTabChange = (newTab: "build" | "train" | "test") => {
    // when switching to train tab, the layers are automatically saved in context
    setTab(newTab);
  };

  return (
    <div>
      <div>
        <button onClick={() => handleTabChange("build")}>Build</button>
        <button onClick={() => handleTabChange("train")}>Train</button>
        <button onClick={() => handleTabChange("test")}>Test</button>
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