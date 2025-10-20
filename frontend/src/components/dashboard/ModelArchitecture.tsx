// ModelArchitecture.tsx - FIXED VERSION
import React from 'react';
import LayerConfig from './LayerComponent';
import type { Layer } from '../../types/model';

interface ModelArchitectureProps {
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
}

export default function ModelArchitecture({ layers, setLayers }: ModelArchitectureProps) {
  const [nextId, setNextId] = React.useState<number>(layers.length + 1);

  // FIXED: Use the current layers directly instead of functional update
  const updateLayer = (id: number, updates: Partial<Layer>) => {
    const updatedLayers = layers.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    );
    setLayers(updatedLayers);
  };

  const addConvolutionalLayer = () => {
    const newLayer: Layer = {
      id: nextId,
      type: 'Convolutional',
      outputChannels: 64,
      kernelSize: 3,
      activation: 'ReLU',
    };
    setLayers([...layers, newLayer]);
    setNextId(nextId + 1);
  };

  const addFullyConnectedLayer = () => {
    const newLayer: Layer = {
      id: nextId,
      type: 'Fully Connected',
      units: 128,
      activation: 'ReLU',
    };
    setLayers([...layers, newLayer]);
    setNextId(nextId + 1);
  };

  const removeLayer = (idToRemove: number) => {
    setLayers(layers.filter(layer => layer.id !== idToRemove));
  };

  return (
    <div>
      <h2>Model Architecture</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {layers.map(layer => (
          <LayerConfig
            key={layer.id}
            id={layer.id}
            type={layer.type}
            outputChannels={layer.outputChannels}
            kernelSize={layer.kernelSize}
            activation={layer.activation}
            units={layer.units}
            onRemove={removeLayer}
          />
        ))}
      </div>
      <button onClick={addFullyConnectedLayer}>Add Fully Connected</button>
      <button onClick={addConvolutionalLayer}>Add Convolutional</button>
    </div>
  );
}