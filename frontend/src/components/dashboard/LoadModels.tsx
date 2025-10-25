import React, { useState, useEffect } from 'react';
import { useModel } from '../../contexts/ModelContext';
//@ts-ignore
import { useAuth } from '../../contexts/authContext/index';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

interface SavedModel {
  id: string;
  name: string;
  layers: any[];
  createdAt: any;
}

export default function LoadModels() {
  const { setLayers } = useModel();
  const { currentUser } = useAuth();
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadUserModels();
    }
  }, [currentUser]);

  const loadUserModels = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const modelsQuery = query(
        collection(db, 'users', currentUser.uid, 'models'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(modelsQuery);
      const models = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedModel[];

      setSavedModels(models);
    } catch (error) {
      console.error('Error loading models:', error);
      setMessage('Error loading models');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadModel = (model: SavedModel) => {
    setLayers(model.layers);
    setMessage(`Model "${model.name}" loaded successfully!`);

    setTimeout(() => setMessage(''), 3000);
  };

const handleDeleteModel = async (modelId: string) => {
  if (!currentUser) return;

  try {
    // Use the correct Firebase v9 syntax
    const modelRef = doc(db, 'users', currentUser.uid, 'models', modelId);
    await deleteDoc(modelRef);
    
    setSavedModels(prevModels => prevModels.filter(model => model.id !== modelId));
    setMessage('Model deleted successfully');
  } catch (error) {
    console.error('Error deleting model:', error);
    setMessage('Error deleting model');
  }
};


  if (!currentUser) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-white shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Load Models</h3>
        <p className="text-gray-400">Please log in to view your saved models</p>
      </div>
    );
  }

  return (
    // Main container background and border color adjusted to match the aesthetic.
    <div className="w-full p-4 bg-[#1e293b] rounded-xl border border-[#374151] shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Your Models</h3>
        {/* Refresh button styled to resemble the 'Add' buttons in the image */}
        <button
          onClick={loadUserModels}
          disabled={isLoading}
          className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-[#1f2937] border border-purple-500 rounded-lg hover:bg-purple-900/20 transition-colors duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {message && (
        <p className={`mb-4 text-sm ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}

      {isLoading ? (
        <p className="text-gray-400">Loading your models...</p>
      ) : savedModels.length === 0 ? (
        <p className="text-gray-400">No saved models found</p>
      ) : (
        <div className="space-y-3">
          {savedModels.map((model) => (
            // Individual model item styled to match the layer boxes in the image
            <div
              key={model.id}
              className="flex justify-between items-center p-4 bg-[#0f0f0f] rounded-lg border border-[#4a6380]/40 shadow-md transition-all hover:border-purple-500/40"
            >
              <div>
                <strong className="text-[#a78bfa] text-base font-medium block">{model.name}</strong>
                <p className="mt-1 text-xs text-gray-400">
                  {model.layers.length} layers • 
                  {model.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                </p>
              </div>
              <div className="flex space-x-2">
                {/* Delete button styled with a dark background and red border */}
                <button
                  onClick={() => handleDeleteModel(model.id)}
                  className="flex items-center justify-center p-2 text-white bg-red-900/40 border border-red-500 rounded-lg hover:bg-red-700/60 transition-colors duration-200"
                  aria-label="Delete Model"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                {/* Load button styled with a dark background and blue/purple border, similar to the 'Add' buttons */}
                <button
                  onClick={() => handleLoadModel(model)}
                  className="px-4 py-2 text-sm font-medium bg-[#334155] hover:bg-[#3f4f62] 
                     text-white text-sm font-medium rounded-lg
                     transition-all duration-200 ease-out
                     border border-white/5 hover:border-white/10"
                >
                  Load
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}