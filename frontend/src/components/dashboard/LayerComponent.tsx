// LayerConfig.tsx
import React from 'react';

// Define the shape of the data for a layer, including the new onRemove function
interface LayerProps {
  id: number;
  type: 'Convolutional' | 'Fully Connected';
  outputChannels?: number;
  kernelSize?: number;
  activation?: 'ReLU' | 'Sigmoid' | 'Tanh';
  units?: number; // for Fully Connected Layer
  onRemove: (id: number) => void; // Function to call when the layer is removed
}

export default function LayerConfig({ id, type, outputChannels, kernelSize, activation, units, onRemove }: LayerProps) {
  const layerStyle: React.CSSProperties = {
    border: '2px solid #ccc',
    padding: '15px',
    margin: '10px',
    borderRadius: '8px',
    display: 'inline-block',
    minWidth: '250px',
    verticalAlign: 'top',
    position: 'relative', // To position the close button absolutely within the layer
  };

  const removeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '5px',
    right: '5px',
    background: 'none',
    border: 'none',
    color: 'red',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '1',
  };

  return (
    <div style={layerStyle}>
      <button
        style={removeButtonStyle}
        onClick={() => onRemove(id)} // Pass the layer's unique ID back to the parent
      >
        X
      </button>
      <h3>{type} Layer (ID: {id})</h3>
      {type === 'Convolutional' && (
        <>
          <div>
            <label>
              Output Channels
              <input type="number" defaultValue={outputChannels} />
            </label>
          </div>
          <div>
            <label>
              Kernel Size
              <input type="number" defaultValue={kernelSize} />
            </label>
          </div>
          <div>
            <label>
              Activation Function
              <select defaultValue={activation}>
                <option>ReLU</option>
                <option>Sigmoid</option>
                <option>Tanh</option>
              </select>
            </label>
          </div>
        </>
      )}
      {type === 'Fully Connected' && (
        <div>
          <label>
            Units
            <input type="number" defaultValue={units} />
          </label>
        </div>
      )}
    </div>
  );
}