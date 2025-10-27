// train-view.tsx
import React, { useState, useCallback } from "react";
import type { Layer } from '../../types/model'; 
import { useModel } from '../../contexts/ModelContext'; 

const useModelArchitectureState = () => {
    const [layers, setLayers] = useState<Layer[]>([
        { id: 1, type: 'Input', inputShape: [28, 28, 1] },
        { id: 2, type: 'Convolutional', outputChannels: 32, kernelSize: 3, activation: 'ReLU' },
        { id: 3, type: 'Fully Connected', units: 10, activation: 'Softmax' }
    ]);
    return { layers, setLayers };
}

export default function TrainView() {
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [config, setConfig] = useState({
    epochs: 10,
    batchSize: 64,
    learningRate: 0.001,
    optimizer: 'Adam',
  });
  
  const { layers } = useModel(); 

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };
  
  const startTraining = useCallback(async () => {
    setIsTraining(true);
    setConsoleOutput(["Starting training..."]);
    
    const trainingPayload = {
      model_layers: layers.map(layer => {
        const { id, ...rest } = layer;
        return rest;
      }),
      training_config: config,
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setConsoleOutput(prev => [...prev, ...data.output, `\n--- Training Finished! ---`, `Final Loss: ${data.loss.toFixed(4)} | Accuracy: ${data.accuracy.toFixed(4)}`]);
    } catch (error) {
      setConsoleOutput(prev => [...prev, `\nERROR: Could not connect to backend or training failed. Is 'python app.py' running? Details: ${error}`]);
    } finally {
      setIsTraining(false);
    }
  }, [layers, config]);

  const totalParams = layers.length * 1000;

  return (
    <div style={{ padding: '20px' }}>
      <h1 className="">Train</h1>
      <div style={{ display: "flex", gap: "3rem" }} className="bg-[#1e293b] rounded-xl p-6 border border-white/10">
        <div style={{ width: '300px' }}>
          <h2 className="underline-title-text">Training Configuration</h2>
          <div className="black-purple-hover-div">
            <p className="bg-purple-500/20 text-blue-200 font-mono text-sm p-0.5 border-purple-800 rounded-md text-center">Neural Network Params: {totalParams.toLocaleString()}</p>
            <p className="bg-purple-500/20 text-blue-200 font-mono text-sm p-0.5 mt-1.5 border-purple-800 rounded-md text-center">Neural Network Layers: {layers.length}</p>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>
              Epochs:
              <input type="number" name="epochs" value={config.epochs} onChange={handleConfigChange} disabled={isTraining} className="black-purple-hover" />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>
              Batch Size:
              <input type="number" name="batchSize" value={config.batchSize} onChange={handleConfigChange} disabled={isTraining} className="black-purple-hover" />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>
              Learning Rate:
              <input type="number" name="learningRate" step="0.0001" value={config.learningRate} onChange={handleConfigChange} disabled={isTraining} className="black-purple-hover" />
            </label>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block' }}>
              Optimizer:
              <select name="optimizer" value={config.optimizer} onChange={handleConfigChange} disabled={isTraining} className="black-purple-hover">
                <option>Adam</option>
                <option>SGD</option>
                <option>RMSprop</option>
              </select>
            </label>
          </div>

          <button 
            onClick={startTraining} 
            disabled={isTraining}
            className="btn-transparent-white"
          >
            {isTraining ? 'Training in Progress...' : 'Start Training'}
          </button>
        </div>

        <div style={{ flex: 1 }}>
          <h2 className="underline-title-text">Training Console Output</h2>
          <div 
            style={{ 
              backgroundColor: '#272b35', 
              color: '#d4d4d4', 
              padding: '15px', 
              borderRadius: '8px', 
              fontFamily: 'monospace', 
              height: '400px', 
              overflowY: 'scroll',
              whiteSpace: 'pre-wrap'
            }}
            className="bg-[#111827] text-green-400 font-mono text-sm p-3 rounded-md border border-purple-800/30 shadow-inner hover:border-purple-500/40">
            {consoleOutput.length > 0 ? consoleOutput.join('\n') : "Click 'Start Training' to begin..."}
          </div>
        </div>
      </div>
    </div>
  );
}