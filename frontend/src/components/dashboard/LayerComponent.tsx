import React from 'react';
import type { Layer } from '../../types/model'; // ✅ Import type-only (no runtime errors)

interface LayerConfigProps extends Layer {
  onRemove: (id: number) => void;
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
}: LayerConfigProps) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        width: '220px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <h4>{type} Layer</h4>

      {type === 'Convolutional' && (
        <div>
          <p>
            <strong>Output Channels:</strong> {outputChannels}
          </p>
          <p>
            <strong>Kernel Size:</strong> {kernelSize}
          </p>
        </div>
      )}

      {type === 'Fully Connected' && (
        <div>
          <p>
            <strong>Units:</strong> {units}
          </p>
        </div>
      )}

      {activation && (
        <p>
          <strong>Activation:</strong> {activation}
        </p>
      )}

      {inputShape && (
        <p>
          <strong>Input Shape:</strong> [{inputShape.join(', ')}]
        </p>
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
