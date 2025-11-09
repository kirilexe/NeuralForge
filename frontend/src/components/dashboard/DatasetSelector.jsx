import React, { useState } from "react";

export default function DatasetSelector() {
  const [selectedDataset, setSelectedDataset] = useState("mnist");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
    // Reset file when switching to MNIST
    if (event.target.value === "mnist") {
      setUploadedFile(null);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSendToBackend = async () => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      if (selectedDataset === "custom" && uploadedFile) {
        // Send the custom dataset file
        formData.append('dataset', uploadedFile);
      } else {
        // Send empty form to indicate MNIST (will delete any custom dataset)
        formData.append('use_mnist', 'true');
      }

      const response = await fetch('http://127.0.0.1:5000/upload_dataset', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
      } else {
        throw new Error('Failed to upload dataset');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error uploading dataset');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h2>Dataset</h2>
      <div className="w-full p-4 bg-[#1e2538] rounded-md border border-[#374151] shadow-2xl">
        <label className="block mb-2">
          <input
            className="m-1"
            type="radio"
            name="dataset"
            value="mnist"
            checked={selectedDataset === "mnist"}
            onChange={handleDatasetChange}
          />
          MNIST (Default)
        </label>
        
        <label className="block mb-3">
          <input
            className="m-1"
            type="radio"
            name="dataset"
            value="custom"
            checked={selectedDataset === "custom"}
            onChange={handleDatasetChange}
          />
          Upload Custom Dataset
        </label>

        {/* Upload box that appears when custom dataset is selected */}
        {selectedDataset === "custom" && (
          <div className="mt-4">
            <label 
              htmlFor="dataset-file"
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
              <p className="text-gray-400 text-sm mb-1">Click to upload your dataset</p>
              <p className="text-gray-500 text-xs">CSV, JSON, ZIP up to 100MB</p>
              <input 
                id="dataset-file" 
                type="file"
                accept=".csv,.json,.zip,.tar.gz"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {uploadedFile && (
              <p className="mt-2 text-green-400 text-sm">
                Selected: {uploadedFile.name}
              </p>
            )}
          </div>
        )}

        {/* Always show the send button */}
        <div className="mt-4 text-center">
          <button
            onClick={handleSendToBackend}
            disabled={isUploading || (selectedDataset === "custom" && !uploadedFile)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              (isUploading || (selectedDataset === "custom" && !uploadedFile))
                ? "btn-transparent-white bg-gray-600"
                : "btn-transparent-white"
            }`}
          >
            {isUploading ? "Uploading..." : 
             selectedDataset === "mnist" ? "Use MNIST Dataset" : 
             "Upload Custom Dataset"}
          </button>
        </div>
      </div>
    </div>
  );
}