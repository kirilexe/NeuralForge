// ModelArchitecture.tsx
import React, { useState } from 'react';
import LayerConfig from './LayerComponent';

interface Layer {
  id: number;
  type: 'Convolutional' | 'Fully Connected';
  outputChannels?: number;
  kernelSize?: number;
  activation?: 'ReLU' | 'Sigmoid' | 'Tanh';
  units?: number;
}

export default function ModelArchitecture() {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 1,
      type: 'Convolutional',
      outputChannels: 32,
      kernelSize: 3,
      activation: 'ReLU',
    },
  ]);

  const [nextId, setNextId] = useState(2);

  const addConvolutionalLayer = () => {
    const newLayer: Layer = {
      id: nextId,
      type: 'Convolutional',
      outputChannels: 64,
      kernelSize: 3,
      activation: 'ReLU',
    };
    // Use a function in setLayers to ensure we get the latest state
    setLayers(prevLayers => [...prevLayers, newLayer]);
    setNextId(nextId + 1);
  };

  const addFullyConnectedLayer = () => {
    const newLayer: Layer = {
      id: nextId,
      type: 'Fully Connected',
      units: 128,
    };
    setLayers(prevLayers => [...prevLayers, newLayer]);
    setNextId(nextId + 1);
  };

  // NEW FUNCTION: Removes a layer by its ID
  const removeLayer = (idToRemove: number) => {
    // Create a new array that excludes the layer with the matching ID
    setLayers(prevLayers => prevLayers.filter(layer => layer.id !== idToRemove));
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
            onRemove={removeLayer} // Pass the removal function to the child component
          />
        ))}
      </div>
      <button onClick={addFullyConnectedLayer}>Add Fully Connected</button>
      <button onClick={addConvolutionalLayer}>Add Convolutional</button>
      <button>Proceed to Training</button>
    </div>
  );
}