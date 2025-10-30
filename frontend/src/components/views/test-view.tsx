// test-view.tsx
import React, { useState, useCallback, useRef } from "react";
import type { Layer } from '../../types/model';

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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

    const handleTestCustomImage = useCallback(async () => {
        if (!selectedFile) {
            setConsoleOutput(["ERROR: Please select an image file first."]);
            return;
        }

        setIsLoading(true);
        setTestImageSrc(null);
        setConsoleOutput(["Starting custom image test..."]);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await fetch(`${API_URL}/test_custom`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
                setConsoleOutput(prev => [...prev, `\nERROR: Custom image test failed. Details: ${errorData.error || errorData.message || response.statusText}`]);
                return;
            }

            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            
            setTestImageSrc(imageUrl);
            setConsoleOutput(prev => [...prev, `\nSUCCESS: Custom image classification visualization generated and displayed.`]);

        } catch (error) {
            setConsoleOutput(prev => [...prev, `\nERROR: Could not connect to backend or test failed. Is 'python app.py' running? Details: ${error}`]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const imageContainerStyle = {
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px 0', 
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 className="underline-title-text">Test</h1>
            <div style={{ display: "flex", gap: "3rem" }}>
                <div style={{ width: '300px' }}>
                    <p className="text-sm">Click the button to test your Neural Network with a random image from the database it has not seen yet.</p>
                    
                    <button
                        onClick={handleTestModel}
                        disabled={isLoading}
                        className="btn-transparent-white mt-1.5 disabled:bg-gray-900"
                    >
                        {isLoading ? 'Generating Insights...' : 'Test with Random Image'}
                    </button>

                    <div style={{ marginTop: '2rem' }}>
                        <p className="text-sm mb-2">Or upload your own image to test:</p>
                        
                        {!selectedFile ? (
                            <label 
                                htmlFor="file"
                                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-8 cursor-pointer hover:border-gray-500 hover:bg-gray-800/50 transition-all bg-gray-800/30"
                            >
                                <svg 
                                    className="w-12 h-12 text-gray-500 mb-3" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                                    />
                                </svg>
                                <p className="text-gray-400 text-sm mb-1">Click to upload an image</p>
                                <p className="text-gray-500 text-xs">PNG, JPG up to 10MB</p>
                                <input 
                                    ref={fileInputRef}
                                    id="file" 
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="border-2 border-gray-600 rounded-lg p-4 bg-gray-800/30">
                                <div className="flex items-center gap-3">
                                    {previewUrl && (
                                        <img 
                                            src={previewUrl} 
                                            alt="Preview" 
                                            className="w-16 h-16 object-cover rounded border border-gray-600"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-300 truncate">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <button
                                        onClick={handleRemoveFile}
                                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                                        title="Remove file"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleTestCustomImage}
                            disabled={isLoading}
                            className="btn-transparent-white mt-1.5 disabled:bg-gray-900"
                        >
                            {isLoading ? 'Generating Insights...' : 'Test with Custom Image'}
                        </button>
                    </div>

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