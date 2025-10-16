// test-view.tsx
import React, { useState, useCallback } from "react";
import type { Layer } from '../../types/model'; // FIXED: use 'import type'

const API_URL = "http://127.0.0.1:5000";

const useModelArchitectureState = () => {
    const [layers] = useState<Layer[]>([
        { id: 1, type: 'Input', inputShape: [28, 28, 1] },
        { id: 2, type: 'Convolutional', outputChannels: 32, kernelSize: 3, activation: 'ReLU' },
        { id: 3, type: 'Fully Connected', units: 10, activation: 'Softmax' }
    ]);
    return { layers };
}

export default function TestView() {
    const [testImageSrc, setTestImageSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [accuracy, setAccuracy] = useState('n/a');
    const [loss, setLoss] = useState('n/a');
    const [consoleOutput, setConsoleOutput] = useState<string[]>(["Awaiting test execution..."]);
    const { layers } = useModelArchitectureState();

    const handleTestModel = useCallback(async () => {
        setIsLoading(true);
        setTestImageSrc(null);
        setConsoleOutput(["Starting model test..."]);

        try {
            const response = await fetch(`${API_URL}/test`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}), 
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
                setConsoleOutput(prev => [...prev, `\nERROR: Test failed. Details: ${errorData.message || response.statusText}`]);
                return;
            }

            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            
            setTestImageSrc(imageUrl);
            setConsoleOutput(prev => [...prev, `\nSUCCESS: Classification visualization generated and displayed.`]);
            
            // NOTE: In a real app, accuracy/loss should be passed from the train view
            setAccuracy("Last Train Accuracy"); 
            setLoss("Last Train Loss");

        } catch (error) {
            setConsoleOutput(prev => [...prev, `\nERROR: Could not connect to backend or test failed. Is 'python app.py' running? Details: ${error}`]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const imageContainerStyle = {
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // Optional: to fit the image nicely inside the scrolling console
        padding: '10px 0', 
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Test</h1>
            <div style={{ display: "flex", gap: "3rem" }}>
                <div style={{ width: '300px' }}>
                    <h2>Test Results</h2>
                    <p>Final performance metrics of your trained model.</p>
                    <div style={{ display: "flex", gap: "2rem" }}>
                        <div>
                            <h3>Accuracy</h3>
                            <p>{accuracy}</p>
                        </div>
                        <div>
                            <h3>Loss</h3>
                            <p>{loss}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleTestModel}
                        disabled={isLoading}
                        style={{ 
                            padding: '10px 20px', 
                            backgroundColor: isLoading ? '#ccc' : '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px',
                            marginTop: '20px' 
                        }}
                    >
                        {isLoading ? 'Generating Insights...' : 'Generate Explainable Insights'}
                    </button>
                </div>
            
                <div style={{ flex: 1 }}>
                    <h2>Training Console Output</h2>
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
                    >
                        {testImageSrc ? (
                            <div style={imageContainerStyle}>
                                <img 
                                    src={testImageSrc} 
                                    alt="Classification Plot" 
                                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                />
                            </div>
                        ) : (
                            consoleOutput.length > 0 ? consoleOutput.join('\n') : "Awaiting test execution..."
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}