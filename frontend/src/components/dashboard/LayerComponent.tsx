import React from 'react';
//@ts-ignore
import Tooltip from './Reuseable/Tooltip';
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
              <div className="flex justify-between items-start">
                {/* 1. Container for Label and Tooltip - uses flex to keep them on one line */}
                <div className="flex items-center space-x-1"> 
                    <label className="block text-xs font-medium text-gray-400">
                        Output Channels
                    </label>
                    
                    {/* 2. Tooltip Component Placed Directly Next to the Label */}
                    <Tooltip
                        title="Output Channels (Filters)"
                        type="Hyperparameter"
                        explanation="This determines the number of feature maps the convolutional layer will learn and produce. It controls the depth of the output volume. The higher the parameter is, the more neurons we have. For example - 64 output channels = ~50000 neurons. (because each channel looks at each pixel of the image 64 times, 28*28*64 = 50176)"
                        smaller="Fewer channels mean fewer features learned, potentially underfitting."
                        bigger="More channels increase model capacity but risk overfitting and dramatically increase computation time."
                        recommendation="Start with powers of 2 (e.g., 32, 64) and double the channels in deeper layers."
                        position="right" // Adjusted position to prevent it from clipping out of the card
                    />
                </div>
              </div>
              
              <input
                type="number"
                value={outputChannels || ''}
                onChange={(e) => handleNumberInputChange('outputChannels', e.target.value)}
                className="black-purple-hover"
                min="1"
              />
            </div>

            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-1"> 
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Kernel Size
                  </label>
                  <Tooltip
                    title="Kernel Size (The Feature Finder)"
                    type="Tuning Setting"
                    explanation="The Kernel is a tiny window (like a magnifying glass) that slides over your image. This number (usually 3) sets the size of that window (e.g., 3x3 pixels) and determines how much of the image the network looks at all at once to find a feature like an edge or a corner."
                    smaller="A small kernel (e.g., 3x3) finds basic, local features like tiny lines. It's fast, efficient, and lets your network go deeper."
                    bigger="A big kernel (e.g., 7x7) looks at a large area to find complex, global features, but it slows down training and uses more memory."
                    recommendation="Start with **3x3**. It's the industry standard because it's the best balance for finding features without wasting computer power."
                    position="right"
                  />
                  </div>
              </div>
              
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
          <div className="flex justify-between items-start">
                <div className="flex items-center space-x-1"> 
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Activation Function
                  </label>
                  <Tooltip
                    title="Activation Function (The Decision Maker)"
                    type="Core Component"
                    explanation="The activation function lives inside every neuron and decides whether that neuron should 'fire' and pass its information to the next layer. It's like turning the neuron 'on' or 'off.' Without it, the network could only learn straight lines and simple patterns."
                    smaller="Using a simple activation (like ReLU) makes the network fast and efficient for finding patterns in images."
                    bigger="Using a complex activation (like Sigmoid or Tanh) can sometimes slow down learning in very deep networks, but is necessary for specific tasks like predicting probabilities."
                    recommendation="Start with ReLU. It is the most common and best choice for most hidden layers in modern neural networks."
                    position="right"
                  />
                </div>
          </div>
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
