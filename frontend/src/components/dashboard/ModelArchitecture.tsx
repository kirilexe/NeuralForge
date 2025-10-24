// ModelArchitecture.tsx 
import React from 'react';
import LayerConfig from './LayerComponent';
import type { Layer } from '../../types/model';

interface ModelArchitectureProps {
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
}

export default function ModelArchitecture({ layers, setLayers }: ModelArchitectureProps) {
  const [nextId, setNextId] = React.useState<number>(layers.length + 1);

  // use the current layers directly instead of functional update
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
    <div className="bg-[#1e293b] rounded-xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h2 className="text-xl font-semibold text-white">Model Architecture</h2>
      </div>
      <p className="text-gray-400 text-sm mb-6">Construct your neural network by adding and configuring layers.</p>
      
      {layers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-lg">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-400 text-sm">Your model is empty.</p>
          <p className="text-gray-500 text-sm">Add a layer to get started.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 mb-6">
          {layers.map(layer => (
            <LayerConfig
              key={layer.id}
              id={layer.id}
              type={layer.type}
              outputChannels={layer.outputChannels}
              kernelSize={layer.kernelSize}
              activation={layer.activation}
              units={layer.units}
              inputShape={layer.inputShape}
              onRemove={removeLayer}
              onUpdate={updateLayer}
            />
          ))}
        </div>
      )}
      
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <button 
          onClick={addFullyConnectedLayer}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#334155] hover:bg-[#3f4f62] 
                     text-white text-sm font-medium rounded-lg
                     transition-all duration-200 ease-out
                     border border-white/5 hover:border-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Fully Connected
        </button>
        <button 
          onClick={addConvolutionalLayer}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#334155] hover:bg-[#3f4f62] 
                     text-white text-sm font-medium rounded-lg
                     transition-all duration-200 ease-out
                     border border-white/5 hover:border-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Convolutional
        </button>
      </div>
    </div>
  );
}