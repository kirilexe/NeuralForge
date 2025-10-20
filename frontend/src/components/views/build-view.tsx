import React from "react";
import ModelArchitecture from "../dashboard/ModelArchitecture";
import DatasetSelector from "../dashboard/DatasetSelector";
import SaveLoadPanel from "../dashboard/SaveLoadPanel";
import { useModel } from "../../contexts/ModelContext"

export default function BuildView() {
  const { layers, setLayers } = useModel(); // shared state

  return (
    <div>
      <h1>Build</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <ModelArchitecture layers={layers} setLayers={setLayers} />
        </div>
        <div>
          <DatasetSelector />
        </div>
      </div>
    </div>
  );
}