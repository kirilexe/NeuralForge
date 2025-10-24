import React from 'react';
import type { Layer } from '../../types/model';
//@ts-ignore

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

  // Convert undefined activation to empty string for the dropdown
  const displayActivation = activation || '';

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        width: '240px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <h4>{type} Layer</h4>

      {type === 'Convolutional' && (
        <div>
          <div style={{ marginBottom: '8px' }}>
            <label>
              <strong>Output Channels:</strong>
              <input
                type="number"
                value={outputChannels || ''}
                onChange={(e) => handleNumberInputChange('outputChannels', e.target.value)}
                style={{
                  width: '60px',
                  marginLeft: '8px',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                min="1"
              />
            </label>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label>
              <strong>Kernel Size:</strong>
              <input
                type="number"
                value={kernelSize || ''}
                onChange={(e) => handleNumberInputChange('kernelSize', e.target.value)}
                style={{
                  width: '60px',
                  marginLeft: '8px',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                min="1"
              />
            </label>
          </div>
        </div>
      )}

      {type === 'Fully Connected' && (
        <div>
          <div style={{ marginBottom: '8px' }}>
            <label>
              <strong>Units:</strong>
              <input
                type="number"
                value={units || ''}
                onChange={(e) => handleNumberInputChange('units', e.target.value)}
                style={{
                  width: '80px',
                  marginLeft: '8px',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                min="1"
              />
            </label>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '8px' }}>
        <label>
          <strong>Activation:</strong>
          <select
            value={displayActivation}
            onChange={(e) => {
              const newValue = e.target.value === '' ? undefined : e.target.value;
              //@ts-ignore
              handleInputChange('activation', newValue);
            }}
            style={{
              marginLeft: '8px',
              padding: '4px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <option value="">None</option>
            <option value="ReLU">ReLU</option>
            <option value="Sigmoid">Sigmoid</option>
            <option value="Tanh">Tanh</option>
            <option value="Softmax">Softmax</option>
          </select>
        </label>
      </div>

      {inputShape && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Input Shape:</strong>
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            {inputShape.map((dim, index) => (
              <input
                key={index}
                type="number"
                value={dim}
                onChange={(e) => handleArrayInputChange('inputShape', e.target.value, index)}
                style={{
                  width: '40px',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                min="1"
              />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onRemove(id)}
        style={{
          marginTop: '8px',
          backgroundColor: '#ff6666',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          cursor: 'pointer',
        }}
      >
        Remove
      </button>
    </div>
  );
}