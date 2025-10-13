import React from "react";
import ModelArchitecture from "../dashboard/ModelArchitecture";
import DatasetSelector from "../dashboard/DatasetSelector";
import SaveLoadPanel from "../dashboard/SaveLoadPanel";

export default function BuildView() {
  return (
    <div>
      <h1>Build</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <ModelArchitecture />
        </div>
        <div>
          <DatasetSelector />
          <SaveLoadPanel />
        </div>
      </div>
    </div>
  );
}