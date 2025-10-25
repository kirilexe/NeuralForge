import React from 'react';
import type { Layer } from '../../types/model';

interface LayerConfigProps extends Layer {
  onRemove: (id: number) => void;
  onUpdate: (id: number, updates: Partial<Layer>) => void;
}

export default function LayerComponent({
  id,
  type,
  outputChannels,
  kernelSize,
  activation,
  units,
  inputShape,
  onRemove,
  onUpdate,
}: LayerConfigProps) {
  const handleInputChange = (field: keyof Layer, value: string | number) => {
    onUpdate(id, { [field]: value });
  };

  const handleNumberInputChange = (field: keyof Layer, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numValue)) {
      onUpdate(id, { [field]: numValue });
    }
  };

  const handleArrayInputChange = (field: keyof Layer, value: string, index: number) => {
    if (!inputShape) return;
    const newArray = [...inputShape];
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numValue)) {
      newArray[index] = numValue;
      onUpdate(id, { [field]: newArray });
    }
  };

  const displayActivation = activation || '';

  return (
    <div className="w-full p-4 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] shadow-sm transition-all hover:border-purple-500/40">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-[#a78bfa] font-semibold text-base">{type} Layer</h4>
          <p className="text-gray-500 text-xs mt-0.5">Layer {id}</p>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-red-400 transition-colors duration-150 bg-[#1a1a1a] hover:bg-[#2a0000] rounded-md p-1.5"
          title="Remove layer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {type === 'Convolutional' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Output Channels
              </label>
              <input
                type="number"
                value={outputChannels || ''}
                onChange={(e) => handleNumberInputChange('outputChannels', e.target.value)}
                className="black-purple-hover"
                min="1"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Kernel Size
              </label>
              <input
                type="number"
                value={kernelSize || ''}
                onChange={(e) => handleNumberInputChange('kernelSize', e.target.value)}
                className="black-purple-hover"
                min="1"
              />
            </div>
          </>
        )}

        {type === 'Fully Connected' && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Units</label>
            <input
              type="number"
              value={units || ''}
              onChange={(e) => handleNumberInputChange('units', e.target.value)}
              className="black-purple-hover"
              min="1"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Activation Function
          </label>
          <select
            value={displayActivation}
            onChange={(e) => {
              const newValue = e.target.value === '' ? undefined : e.target.value;
              //@ts-ignore
              handleInputChange('activation', newValue);
            }}
            className="black-purple-hover"
          >
            <option value="">None</option>
            <option value="ReLU">ReLU</option>
            <option value="Sigmoid">Sigmoid</option>
            <option value="Tanh">Tanh</option>
            <option value="Softmax">Softmax</option>
          </select>
        </div>
      </div>
    </div>
  );
}
