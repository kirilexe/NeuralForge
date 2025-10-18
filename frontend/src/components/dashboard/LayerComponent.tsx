// LayerComponent.tsx
import React from 'react';
import type { Layer } from '../../types/model';

interface LayerConfigProps {
  id: number;
  type: Layer['type'];
  outputChannels?: number;
  kernelSize?: number;
  activation?: string;
  units?: number;
  onRemove: (id: number) => void;
  onUpdate: (id: number, updates: Partial<Layer>) => void; // Add this
}

export default function LayerConfig({ 
  id, 
  type, 
  outputChannels, 
  kernelSize, 
  activation, 
  units, 
  onRemove,
  onUpdate 
}: LayerConfigProps) {
  
  const handleChange = (field: string, value: any) => {
    onUpdate(id, { [field]: value });
  };

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '15px', 
      borderRadius: '8px',
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>{type} Layer</h4>
        <button onClick={() => onRemove(id)} style={{ background: 'red', color: 'white', border: 'none', borderRadius: '4px' }}>
          ×
        </button>
      </div>

      {/* Convolutional Layer Parameters */}
      {type === 'Convolutional' && (
        <div>
          <label>
            Output Channels:
            <input 
              type="number" 
              value={outputChannels || 32} 
              onChange={(e) => handleChange('outputChannels', parseInt(e.target.value))}
              style={{ marginLeft: '8px', width: '60px' }}
            />
          </label>
          <br />
          <label>
            Kernel Size:
            <input 
              type="number" 
              value={kernelSize || 3} 
              onChange={(e) => handleChange('kernelSize', parseInt(e.target.value))}
              style={{ marginLeft: '8px', width: '60px' }}
            />
          </label>
          <br />
          <label>
            Activation:
            <select 
              value={activation || 'ReLU'} 
              onChange={(e) => handleChange('activation', e.target.value)}
              style={{ marginLeft: '8px' }}
            >
              <option value="ReLU">ReLU</option>
              <option value="Sigmoid">Sigmoid</option>
              <option value="Tanh">Tanh</option>
            </select>
          </label>
        </div>
      )}

      {/* Fully Connected Layer Parameters */}
      {type === 'Fully Connected' && (
        <div>
          <label>
            Units:
            <input 
              type="number" 
              value={units || 128} 
              onChange={(e) => handleChange('units', parseInt(e.target.value))}
              style={{ marginLeft: '8px', width: '60px' }}
            />
          </label>
          <br />
          <label>
            Activation:
            <select 
              value={activation || 'ReLU'} 
              onChange={(e) => handleChange('activation', e.target.value)}
              style={{ marginLeft: '8px' }}
            >
              <option value="ReLU">ReLU</option>
              <option value="Sigmoid">Sigmoid</option>
              <option value="Tanh">Tanh</option>
              <option value="Softmax">Softmax</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}