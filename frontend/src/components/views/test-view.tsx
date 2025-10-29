// test-view.tsx
import React, { useState, useCallback } from "react";
import type { Layer } from '../../types/model'; // FIXED: use 'import type'

const API_URL = "http://127.0.0.1:5000";

// let lossValue = null;

// let accValue = trainView.chartAcc;

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
            
            // todo
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
            <h1 className="underline-title-text">Test</h1>
            <div style={{ display: "flex", gap: "3rem" }}>
                <div style={{ width: '300px' }}>
                    <p className="text-sm">Click the button to test your Neural Network with a random image from the database it has not seen yet.</p>
                    {/*
                     
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
                    */}

                    <button
                        onClick={handleTestModel}
                        disabled={isLoading}
                        className="btn-transparent-white mt-1.5 disabled:bg-gray-900"
                    >
                        {isLoading ? 'Generating Insights...' : 'Generate Explainable Insights'}
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