import React, { useState, useEffect } from 'react';
import { useModel } from '../../contexts/ModelContext';
//@ts-ignore
import { useAuth } from '../../contexts/authContext/index';
import { db } from '../../firebase/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, serverTimestamp, orderBy, query, updateDoc } from 'firebase/firestore';

export default function DefaultModels() {
  const { setLayers, layers } = useModel();
  const { currentUser, userRole } = useAuth();
  const [defaultModels, setDefaultModels] = useState<any[]>([]);
  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    loadDefaultModels();
  }, []);

  const loadDefaultModels = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'defaultModels'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const models = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDefaultModels(models);
    } catch (err) {
      console.error(err);
      setMessage('Error loading defaults');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDefault = async () => {
    if (!modelName.trim()) {
      setMessage('Model name required');
      return;
    }

    setIsSaving(true);
    try {
      const ref = doc(collection(db, 'defaultModels'));
      await setDoc(ref, {
        name: modelName,
        layers,
        createdAt: serverTimestamp(),
        createdBy: currentUser?.uid || null,
      });
      setMessage('Default model saved');
      setModelName('');
      loadDefaultModels();
    } catch (err) {
      console.error(err);
      setMessage('Error saving default model');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDefault = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'defaultModels', id));
      setDefaultModels(prev => prev.filter(m => m.id !== id));
      setMessage('Deleted successfully');
    } catch (err) {
      console.error(err);
      setMessage('Error deleting');
    }
  };

  const handleLoadModel = (model: any) => {
    setLayers(model.layers);
    setMessage(`Loaded default "${model.name}"`);
    setTimeout(() => setMessage(''), 3000);
  };

  // EDIT NAME FUNCTIONALITY
  const handleEditModelName = async (modelId: string, newName: string) => {
    try {
      const modelRef = doc(db, 'defaultModels', modelId);
      await updateDoc(modelRef, {
        name: newName
      });

      setDefaultModels(prevModels =>
        prevModels.map(model =>
          model.id === modelId ? { ...model, name: newName } : model
        )
      );

      setMessage(`Default model renamed to "${newName}" successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error renaming default model: ', error);
      setMessage('Error renaming default model.');
    }
  };

  // OVERWRITE FUNCTIONALITY
  const handleOverwriteModel = async (modelId: string) => {
    try {
      const modelRef = doc(db, 'defaultModels', modelId);
      
      await updateDoc(modelRef, {
        layers: layers,
        updatedAt: serverTimestamp()
      });

      setDefaultModels(prevModels =>
        prevModels.map(model =>
          model.id === modelId ? { ...model, layers: layers } : model
        )
      );

      const modelName = defaultModels.find(m => m.id === modelId)?.name;
      setMessage(`Default model "${modelName}" overwritten successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error overwriting default model:', error);
      setMessage('Error overwriting default model');
    }
  };

  // EDITING UI HELPERS
  const startEditing = (model: any) => {
    setEditingModelId(model.id);
    setEditedName(model.name);
  };

  const cancelEditing = () => {
    setEditingModelId(null);
    setEditedName('');
  };

  const saveEditing = async (modelId: string) => {
    if (editedName.trim() && editedName !== defaultModels.find(m => m.id === modelId)?.name) {
      await handleEditModelName(modelId, editedName.trim());
    }
    setEditingModelId(null);
    setEditedName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, modelId: string) => {
    if (e.key === 'Enter') {
      saveEditing(modelId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="w-full p-4 bg-[#1e2538] rounded-md border border-[#374151] shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Default Layer Configurations</h3>
        <button
          onClick={loadDefaultModels}
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

      {/* Admin-only save form */}
      {userRole === "admin" && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter name for default config"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#1a1a1a] text-white text-sm rounded-md border border-transparent outline-none transition-all duration-150 hover:border-[#a78bfa] focus:border-[#a78bfa] mb-2"
          />
          <button
            onClick={handleSaveDefault}
            disabled={isSaving || !modelName.trim()}
            className="px-4 py-2 text-sm font-medium bg-[#334155] hover:bg-[#3f4f62] text-white rounded-lg transition-all duration-200 ease-out border border-white/5 hover:border-white/10"
          >
            {isSaving ? 'Saving...' : 'Save as Default'}
          </button>
        </div>
      )}

      {/* List of default models */}
      {defaultModels.length === 0 ? (
        <p className="text-gray-400">No default configurations</p>
      ) : (
        <div className="space-y-3">
          {defaultModels.map((model) => (
            <div
              key={model.id}
              className="flex justify-between items-center p-4 bg-[#0f0f0f] rounded-lg border border-[#4a6380]/40 shadow-md transition-all hover:border-purple-500/40"
            >
              <div className="flex-1">
                {editingModelId === model.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, model.id)}
                      className="px-3 py-1 bg-[#1e2538] border border-purple-500 rounded text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEditing(model.id)}
                      className="p-1 text-green-400 hover:text-green-300 transition-colors"
                      aria-label="Save"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      aria-label="Cancel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <strong className="text-[#a78bfa] text-base font-medium block">{model.name}</strong>
                    {userRole === "admin" && (
                      <button
                        onClick={() => startEditing(model)}
                        className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                        aria-label="Edit Name"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {model.layers.length} layers • {model.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                </p>
              </div>
              <div className="flex space-x-2">
                {editingModelId !== model.id && userRole === "admin" && (
                  <>
                    {/* Overwrite Button */}
                    <button
                      onClick={() => handleOverwriteModel(model.id)}
                      className="flex items-center justify-center p-2 text-white bg-blue-900/40 border border-blue-500 rounded-lg hover:bg-blue-700/60 transition-colors duration-200"
                      aria-label="Overwrite with Current Architecture"
                      title="Replace this model's layers with your current architecture"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteDefault(model.id)}
                      className="flex items-center justify-center p-2 text-white bg-red-900/40 border border-red-500 rounded-lg hover:bg-red-700/60 transition-colors duration-200"
                      aria-label="Delete Model"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleLoadModel(model)}
                  className="px-4 py-2 text-sm font-medium bg-[#334155] hover:bg-[#3f4f62] text-white rounded-lg border border-white/5 hover:border-white/10"
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