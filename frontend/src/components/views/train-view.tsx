// train-view.tsx
import React, { useState, useCallback, useRef } from "react";
import { LineChart } from '@mui/x-charts';
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
  // Keep histories for plotting later. We store values in refs to avoid
  // unnecessary re-renders while streaming training updates.
  const lossHistoryRef = useRef<number[]>([]);
  const accuracyHistoryRef = useRef<number[]>([]);
  // State copies used for rendering the chart in real-time. We snapshot
  // the refs into these arrays whenever new epoch data arrives.
  const [chartLoss, setChartLoss] = useState<number[]>([]);
  const [chartAcc, setChartAcc] = useState<number[]>([]);
  
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
      // Use the streaming endpoint and read the response body as it arrives
      const response = await fetch('http://127.0.0.1:5000/train_stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingPayload),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error or no streaming body! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Read chunks as they arrive and parse SSE-style `data: ...\n\n` events.
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n').map(l => l.trim());
          const dataLine = lines.find(l => l.startsWith('data:'));
          if (!dataLine) {
            // If not an SSE data line, append raw part
            setConsoleOutput(prev => [...prev, part]);
            continue;
          }

          const jsonStr = dataLine.replace(/^data:\s*/, '');
          try {
            const parsed = JSON.parse(jsonStr);

            // Live epoch updates
            if (parsed.epoch !== undefined) {
              const msg = `Epoch ${parsed.epoch} - Loss: ${parsed.loss?.toFixed?.(4) ?? parsed.loss} | Accuracy: ${parsed.accuracy?.toFixed?.(4) ?? parsed.accuracy}`;
              setConsoleOutput(prev => [...prev, msg]);

              // Unused variables for inspection and also log to browser console
              const _live_loss = parsed.loss;
              const _live_accuracy = parsed.accuracy;
              console.log('Live epoch update - loss:', _live_loss, 'accuracy:', _live_accuracy);
              // Save values into history refs so they can be used for charts later.
              try {
                if (_live_loss !== undefined && _live_loss !== null) {
                  lossHistoryRef.current.push(Number(_live_loss));
                }
                if (_live_accuracy !== undefined && _live_accuracy !== null) {
                  accuracyHistoryRef.current.push(Number(_live_accuracy));
                }
              } catch (e) {
                // Defensive: if conversion fails, ignore and continue streaming
                console.warn('Failed to record live epoch values', e);
              }
              // Snapshot into state so the chart re-renders in real-time.
              setChartLoss([...lossHistoryRef.current]);
              setChartAcc([...accuracyHistoryRef.current]);
            }

            // Final summary once done
            else if (parsed.done) {
              setConsoleOutput(prev => [...prev, '\n--- Training Finished! ---', `Final Loss: ${parsed.loss?.toFixed?.(4) ?? parsed.loss} | Accuracy: ${parsed.accuracy?.toFixed?.(4) ?? parsed.accuracy}`]);
              const _final_loss = parsed.loss;
              const _final_accuracy = parsed.accuracy;
              console.log('Training finished - loss:', _final_loss, 'accuracy:', _final_accuracy);
              // Also record final values into histories (if present)
              try {
                if (_final_loss !== undefined && _final_loss !== null) {
                  lossHistoryRef.current.push(Number(_final_loss));
                }
                if (_final_accuracy !== undefined && _final_accuracy !== null) {
                  accuracyHistoryRef.current.push(Number(_final_accuracy));
                }
              } catch (e) {
                console.warn('Failed to record final training values', e);
              }
              // Snapshot final values into chart state as well
              setChartLoss([...lossHistoryRef.current]);
              setChartAcc([...accuracyHistoryRef.current]);
            }

            // If the backend sent an output array, append it
            else if (parsed.output) {
              setConsoleOutput(prev => [...prev, ...(parsed.output as string[])]);
            }

          } catch (e) {
            // If JSON parse fails, just append the raw part to console
            setConsoleOutput(prev => [...prev, part]);
          }
        }
      }

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
          {/* Live chart preview (updates in real-time) */}
          
          <div style={{ marginTop: '16px' }} className="mt-4 p-3 rounded-md bg-slate-900">
            <h3 className="underline-title-text">Training Chart</h3>
            <div style={{ background: '#0b1220', padding: '12px', borderRadius: 8 }} className="text-white">
              <LineChart
                series={[
                  { data: chartLoss, label: 'Loss', yAxisId: 'leftAxisId', },
                  { data: chartAcc, label: 'Accuracy', yAxisId: 'rightAxisId' },
                ]}
                xAxis={[{ scaleType: 'point', data: chartLoss.map((_, i) => `E${i + 1}`) }]}
                yAxis={[
                  { id: 'leftAxisId', width: 50 },
                  { id: 'rightAxisId', position: 'right' },
                ]}
                // small fixed height so it fits under the console
                sx={{ 
                  height: 200,
                  '& text': {
                    fill: 'white',
                  },
                  '& line': {
                    stroke: 'white',
                  },
                  '& .MuiChartsAxis-line': {
                    stroke: 'white !important',
                  },  
                  '& .MuiChartsAxis-tick': {
                    stroke: 'white !important',
                  },
                  '& MuiChartsLabel-root MuiChartsLegend-label': {
                    fill: 'white !important',
                    text: 'white !important',
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}