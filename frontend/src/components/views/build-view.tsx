// buildview.tsx - The error is resolved by fixing ModelArchitecture.tsx
import React, { useState } from "react";
import ModelArchitecture from "../dashboard/ModelArchitecture";
import type { Layer } from '../../types/model';
import DatasetSelector from "../dashboard/DatasetSelector";
import SaveLoadPanel from "../dashboard/SaveLoadPanel";

export default function BuildView() {
  const [layers, setLayers] = useState<Layer[]>([
    { id: 1, type: 'Input', inputShape: [28, 28, 1] },
    {
      id: 2,
      type: 'Convolutional',
      outputChannels: 32,
      kernelSize: 3,
      activation: 'ReLU',
    },
    { id: 3, type: 'Output', units: 10, activation: 'Softmax' },
  ]);

  return (
    <div>
      <h1>Build</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <ModelArchitecture layers={layers} setLayers={setLayers} />
        </div>
        <div>
          <DatasetSelector />
          <SaveLoadPanel />
        </div>
      </div>
    </div>
  );
}