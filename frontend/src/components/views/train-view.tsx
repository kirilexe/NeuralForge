import React, { useState, useCallback, useRef } from "react";
import { LineChart } from '@mui/x-charts';
import type { Layer } from '../../types/model'; 
import { useModel } from '../../contexts/ModelContext'; 
//@ts-ignore
import Tooltip from '../dashboard/Reuseable/Tooltip';

const useModelArchitectureState = () => {
  const [layers, setLayers] = useState<Layer[]>([
    { id: 1, type: 'Input', inputShape: [28, 28, 1] },
    { id: 2, type: 'Convolutional', outputChannels: 32, kernelSize: 3, activation: 'ReLU' },
    { id: 3, type: 'Fully Connected', units: 10, activation: 'Softmax' }
  ]);
  return { layers, setLayers };
};

export default function TrainView() {
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [config, setConfig] = useState({
    epochs: 10,
    batchSize: 64,
    learningRate: 0.001,
    optimizer: 'Adam',
  });
  const lossHistoryRef = useRef<number[]>([]);
  const accuracyHistoryRef = useRef<number[]>([]);
  const [chartLoss, setChartLoss] = useState<number[]>([]);
  const [chartAcc, setChartAcc] = useState<number[]>([]);
  const [confusionMatrixUrl, setConfusionMatrixUrl] = useState<string>('');
  const [isLoadingConfusionMatrix, setIsLoadingConfusionMatrix] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'matrix' | 'console'>('chart'); // 🔥 Added tab state

  const { layers } = useModel();

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const fetchConfusionMatrix = async () => {
    setIsLoadingConfusionMatrix(true);
    setConfusionMatrixUrl('');
    try {
      const response = await fetch('http://127.0.0.1:5000/confusion_matrix?' + new Date().getTime());
      if (response.ok) {
        const blob = await response.blob();
        if (blob.type.startsWith('image/')) {
          const url = URL.createObjectURL(blob);
          setConfusionMatrixUrl(url);
          setConsoleOutput(prev => [...prev, "Confusion Matrix: Loaded successfully"]);
        } else {
          setConsoleOutput(prev => [...prev, "Confusion Matrix: Server returned HTML instead of image. Route may not exist."]);
        }
      } else {
        setConsoleOutput(prev => [...prev, `Confusion Matrix: Failed to load (HTTP ${response.status})`]);
      }
    } catch (error) {
      setConsoleOutput(prev => [...prev, `Confusion Matrix: Error - ${error}`]);
    } finally {
      setIsLoadingConfusionMatrix(false);
    }
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
      const response = await fetch('http://127.0.0.1:5000/train_stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingPayload),
      });
      if (!response.ok || !response.body) throw new Error(`HTTP error or no streaming body! status: ${response.status}`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
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
            setConsoleOutput(prev => [...prev, part]);
            continue;
          }
          const jsonStr = dataLine.replace(/^data:\s*/, '');
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.epoch !== undefined) {
              const msg = `Epoch ${parsed.epoch} - Loss: ${parsed.loss?.toFixed?.(4) ?? parsed.loss} | Accuracy: ${parsed.accuracy?.toFixed?.(4) ?? parsed.accuracy}`;
              setConsoleOutput(prev => [...prev, msg]);
              const _live_loss = parsed.loss;
              const _live_accuracy = parsed.accuracy;
              console.log('Live epoch update - loss:', _live_loss, 'accuracy:', _live_accuracy);
              try {
                if (_live_loss !== undefined && _live_loss !== null)
                  lossHistoryRef.current.push(Number(_live_loss));
                if (_live_accuracy !== undefined && _live_accuracy !== null)
                  accuracyHistoryRef.current.push(Number(_live_accuracy));
              } catch (e) {
                console.warn('Failed to record live epoch values', e);
              }
              setChartLoss([...lossHistoryRef.current]);
              setChartAcc([...accuracyHistoryRef.current]);
            } else if (parsed.done) {
              setConsoleOutput(prev => [...prev, '\n--- Training Finished! ---', `Final Loss: ${parsed.loss?.toFixed?.(4) ?? parsed.loss} | Accuracy: ${parsed.accuracy?.toFixed?.(4) ?? parsed.accuracy}`]);
              const _final_loss = parsed.loss;
              const _final_accuracy = parsed.accuracy;
              console.log('Training finished - loss:', _final_loss, 'accuracy:', _final_accuracy);
              try {
                if (_final_loss !== undefined && _final_loss !== null)
                  lossHistoryRef.current.push(Number(_final_loss));
                if (_final_accuracy !== undefined && _final_accuracy !== null)
                  accuracyHistoryRef.current.push(Number(_final_accuracy));
              } catch (e) {
                console.warn('Failed to record final training values', e);
              }
              setChartLoss([...lossHistoryRef.current]);
              setChartAcc([...accuracyHistoryRef.current]);
            } else if (parsed.output) {
              setConsoleOutput(prev => [...prev, ...(parsed.output as string[])]);
            }
          } catch (e) {
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
  const clearGraph = () => {
    lossHistoryRef.current = [];
    accuracyHistoryRef.current = [];
    setChartLoss([]);
    setChartAcc([]);
  };

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

          {/* Config inputs unchanged */}
          {['epochs', 'batchSize', 'learningRate'].map((key, i) => (
            <div style={{ marginBottom: '10px' }} key={i}>
              <label className="block text-xs font-medium text-gray-400 capitalize">{key}:
                <input
                  type="number"
                  name={key}
                  value={config[key as keyof typeof config]}
                  onChange={handleConfigChange}
                  disabled={isTraining}
                  className="black-purple-hover"
                />
              </label>
            </div>
          ))}

          <div style={{ marginBottom: '20px' }}>
            <label className="block text-xs font-medium text-gray-400">
              Optimizer:
              <select name="optimizer" value={config.optimizer} onChange={handleConfigChange} disabled={isTraining} className="black-purple-hover">
                <option>Adam</option>
                <option>SGD</option>
                <option>RMSprop</option>
              </select>
            </label>
          </div>

          <button onClick={() => { clearGraph(); startTraining(); }} disabled={isTraining} className="btn-transparent-white">
            {isTraining ? 'Training in Progress...' : 'Start Training'}
          </button>
          <button onClick={fetchConfusionMatrix} disabled={isLoadingConfusionMatrix} className="btn-transparent-white mt-2">
            {isLoadingConfusionMatrix ? 'Loading...' : 'Show Confusion Matrix'}
          </button>
        </div>

        {/* Tabs and content */}
        <div style={{ flex: 1 }}>
          <div className="underline-title-text mb-2">Visualizations</div>

          {/* Tab buttons */}
          <div className="flex mb-3 space-x-2">
            <button onClick={() => setActiveTab('chart')} className={`px-4 py-1 rounded-md ${activeTab === 'chart' ? 'bg-purple-700 text-white' : 'bg-slate-800 text-gray-400'}`}>Chart</button>
            <button onClick={() => setActiveTab('matrix')} className={`px-4 py-1 rounded-md ${activeTab === 'matrix' ? 'bg-purple-700 text-white' : 'bg-slate-800 text-gray-400'}`}>Matrix</button>
            <button onClick={() => setActiveTab('console')} className={`px-4 py-1 rounded-md ${activeTab === 'console' ? 'bg-purple-700 text-white' : 'bg-slate-800 text-gray-400'}`}>Console</button>
          </div>

          {/* Tab: Chart */}
          {activeTab === 'chart' && (
            <div className="mt-4 p-3 rounded-md bg-slate-900">
              <h3 className="underline-title-text">Training Chart</h3>
              <div style={{ background: '#0b1220', padding: '12px', borderRadius: 8 }} className="text-white">
                <LineChart
                  series={[
                    { data: chartLoss, label: 'Loss', yAxisId: 'leftAxisId' },
                    { data: chartAcc, label: 'Accuracy', yAxisId: 'rightAxisId' },
                  ]}
                  xAxis={[{ scaleType: 'point', data: chartLoss.map((_, i) => `E${i + 1}`) }]}
                  yAxis={[
                    { id: 'leftAxisId', width: 50 },
                    { id: 'rightAxisId', position: 'right' },
                  ]}
                  sx={{
                    height: 350,
                    '& .MuiChartsAxis-root .MuiChartsAxis-tickLabel': { fill: 'white' },
                    '& .MuiChartsAxis-root .MuiChartsAxis-label': { fill: 'white' },
                    '& .MuiChartsAxis-root line': { stroke: 'white' },
                  }}
                />
                <span className="flex">
                  <p className="text-sm font-semibold mr-30">Loss: {chartLoss.length ? Number(chartLoss[chartLoss.length - 1]).toFixed(2) : "—"}</p>
                  <p className="text-sm font-semibold">Accuracy: {chartAcc.length ? (Number(chartAcc[chartAcc.length - 1]) * 100).toFixed(2) + "%" : "—"}</p>
                </span>
              </div>
            </div>
          )}

          {/* Tab: Matrix */}
          {activeTab === 'matrix' && (
            <div className="mt-4">
              <h3 className="underline-title-text">Confusion Matrix</h3>
              <div style={{ background: '#0b1220', padding: '12px', borderRadius: 8 }} className="text-white">
                {confusionMatrixUrl ? (
                  <img
                    src={confusionMatrixUrl}
                    alt="Confusion Matrix"
                    style={{ maxWidth: '100%', height: 'auto' }}
                    onLoad={() => console.log('Confusion matrix image loaded successfully')}
                    onError={() => {
                      console.error('Failed to load confusion matrix image');
                      setConsoleOutput(prev => [...prev, "Confusion Matrix: Failed to display image"]);
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-400">No confusion matrix loaded yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab: Console */}
          {activeTab === 'console' && (
            <div>
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
                className="bg-[#111827] text-green-400 font-mono text-sm p-3 rounded-md border border-purple-800/30 shadow-inner hover:border-purple-500/40"
              >
                {consoleOutput.length > 0 ? consoleOutput.join('\n') : "Click 'Start Training' to begin..."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
