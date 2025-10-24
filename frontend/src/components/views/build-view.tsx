import React from "react";
import ModelArchitecture from "../dashboard/ModelArchitecture";
import DatasetSelector from "../dashboard/DatasetSelector";
import SaveModel from "../dashboard/SaveModel";
import LoadModels from "../dashboard/LoadModels";
import { useModel } from "../../contexts/ModelContext"

export default function BuildView() {
  const { layers, setLayers } = useModel();

  return (
    <div className="space-y-6 pl-8">
      <h1 className="text-3xl font-bold text-white">Build your Neural Network</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ModelArchitecture layers={layers} setLayers={setLayers} />
        </div>
        <div className="flex flex-col gap-6">
          <DatasetSelector />
          <SaveModel />
          <LoadModels />
        </div>
      </div>
    </div>
  );
}