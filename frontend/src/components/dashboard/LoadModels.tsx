import React, { useState, useEffect } from 'react';
import { useModel } from '../../contexts/ModelContext';
//@ts-ignore
import { useAuth } from '../../contexts/authContext/index';
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';

interface SavedModel {
  id: string;
  name: string;
  layers: any[];
  createdAt: any;
}

export default function LoadModels() {
  const { setLayers, layers } = useModel();
  const { currentUser } = useAuth();

  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  // Save section states (kept identical)
  const [modelName, setModelName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) loadUserModels();
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

  const handleSave = async () => {
    if (!modelName.trim()) {
      setMessage('Model name cannot be empty.');
      return;
    }

    if (!currentUser) {
      setMessage('You must be logged in to save a model.');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const modelRef = doc(collection(db, 'users', currentUser.uid, 'models'));
      await setDoc(modelRef, {
        name: modelName,
        layers: layers,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setMessage('Model saved successfully!');
      setModelName('');

      loadUserModels();
    } catch (error) {
      console.error('Error saving model: ', error);
      setMessage('Error saving model');
    } finally {
      setIsSaving(false);
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
      const ref = doc(db, 'users', currentUser.uid, 'models', modelId);
      await deleteDoc(ref);

      setSavedModels(prev => prev.filter(m => m.id !== modelId));
      setMessage('Model deleted successfully');
    } catch (error) {
      console.error('Error deleting model:', error);
      setMessage('Error deleting model');
    }
  };

  const handleEditModelName = async (modelId: string, newName: string) => {
    if (!currentUser) return;

    try {
      const ref = doc(db, 'users', currentUser.uid, 'models', modelId);
      await updateDoc(ref, { name: newName });

      setSavedModels(prev =>
        prev.map(model =>
          model.id === modelId ? { ...model, name: newName } : model
        )
      );

      setMessage(`Saved model renamed to "${newName}" successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error renaming model: ', error);
      setMessage('Error renaming model.');
    }
  };

  const handleOverwriteModel = async (modelId: string) => {
    if (!currentUser) return;

    try {
      const ref = doc(db, 'users', currentUser.uid, 'models', modelId);

      await updateDoc(ref, {
        layers,
        updatedAt: serverTimestamp()
      });

      const name = savedModels.find(m => m.id === modelId)?.name;
      setMessage(`Model "${name}" overwritten successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error overwriting model:', error);
      setMessage('Error overwriting model');
    }
  };

  const startEditing = (model: SavedModel) => {
    setEditingModelId(model.id);
    setEditedName(model.name);
  };

  const cancelEditing = () => {
    setEditingModelId(null);
    setEditedName('');
  };

  const saveEditing = async (id: string) => {
    if (editedName.trim()) {
      await handleEditModelName(id, editedName.trim());
    }
    setEditingModelId(null);
    setEditedName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') saveEditing(id);
    if (e.key === 'Escape') cancelEditing();
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
    <div className="w-full p-4 bg-[#1e2538] rounded-md border border-[#374151] shadow-2xl">

      {/* -------------------------------- */}
      {/* 🔹 ORIGINAL SAVE MODEL UI (UNTOUCHED) */}
      {/* -------------------------------- */}

      <h3>Save Model</h3>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Enter model name"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="w-full px-3 py-1.5 bg-[#1a1a1a] text-white text-sm rounded-md 
            border border-transparent outline-none transition-all duration-150 
            hover:border-[#a78bfa] focus:border-[#a78bfa] mb-2"
        />
        <button
          onClick={handleSave}
          disabled={isSaving || !modelName.trim()}
          className="px-4 py-2 text-sm font-medium bg-[#334155] hover:bg-[#3f4f62] 
            text-white rounded-lg
            transition-all duration-200 ease-out
            border border-white/5 hover:border-white/10"
        >
          {isSaving ? 'Saving...' : 'Save Model'}
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Your Models</h3>
      </div>

      {message && (
        <p
          className={`mb-4 text-sm ${
            message.includes('Error') ? 'text-red-400' : 'text-green-400'
          }`}
        >
          {message}
        </p>
      )}

      {isLoading ? (
        <p className="text-gray-400">Loading your models...</p>
      ) : savedModels.length === 0 ? (
        <p className="text-gray-400">No saved models found</p>
      ) : (
        <div className="space-y-3">
          {savedModels.map(model => (
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
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <strong className="text-[#a78bfa] text-base font-medium block">
                      {model.name}
                    </strong>
                    <button
                      onClick={() => startEditing(model)}
                      className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}

                <p className="mt-1 text-xs text-gray-400">
                  {model.layers.length} layers •
                  {model.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                </p>
              </div>

              <div className="flex space-x-2">
                {editingModelId !== model.id && (
                  <>
                    <button
                      onClick={() => handleDeleteModel(model.id)}
                      className="flex items-center justify-center p-2 text-white bg-red-900/40 border border-red-500 rounded-lg hover:bg-red-700/60 transition-colors duration-200"
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

                    <button
                      onClick={() => handleOverwriteModel(model.id)}
                      className="px-4 py-2 text-sm font-medium bg-[#334155] hover:bg-[#3f4f62] text-white rounded-lg border border-white/5 hover:border-white/10"
                    >
                      Overwrite
                    </button>

                    <button
                      onClick={() => handleLoadModel(model)}
                      className="px-4 py-2 text-sm font-medium bg-[#334155] hover:bg-[#3f4f62] text-white rounded-lg border border-white/5 hover:border-white/10"
                    >
                      Load
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
