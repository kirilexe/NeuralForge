import React from "react";
import ModelArchitecture from "../dashboard/ModelArchitecture";
import DatasetSelector from "../dashboard/DatasetSelector";
import SaveModel from "../dashboard/SaveModel";
import LoadModels from "../dashboard/LoadModels";
import { useModel } from "../../contexts/ModelContext"

export default function BuildView() {
  const { layers, setLayers } = useModel();

  return (
    <div>
      <h1>Build</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <ModelArchitecture layers={layers} setLayers={setLayers} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <DatasetSelector />
          <SaveModel />
          <LoadModels />
        </div>
      </div>
    </div>
  );
}