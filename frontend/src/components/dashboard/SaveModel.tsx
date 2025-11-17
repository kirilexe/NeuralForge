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

  // Editing model name
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  // Saving new model
  const [modelName, setModelName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load saved models when logged in
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

      const snapshot = await getDocs(modelsQuery);
      const models = snapshot.docs.map((doc) => ({
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
    setTimeout(() => setMessage(''), 2500);
  };

  const handleDeleteModel = async (id: string) => {
    if (!currentUser) return;

    try {
      const ref = doc(db, 'users', currentUser.uid, 'models', id);
      await deleteDoc(ref);

      setSavedModels((prev) => prev.filter((m) => m.id !== id));
      setMessage('Model deleted');
    } catch (error) {
      console.error(error);
      setMessage('Error deleting model');
    }
  };

  const handleEditModelName = async (id: string, newName: string) => {
    if (!currentUser) return;

    try {
      const ref = doc(db, 'users', currentUser.uid, 'models', id);
      await updateDoc(ref, { name: newName });

      setSavedModels((prev) =>
        prev.map((m) => (m.id === id ? { ...m, name: newName } : m))
      );

      setMessage(`Renamed model to "${newName}"`);
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Rename error:', error);
      setMessage('Error renaming model');
    }
  };

  const saveNewModel = async () => {
    if (!currentUser) return setMessage('Log in first.');
    if (!modelName.trim()) return setMessage('Model name cannot be empty.');

    setIsSaving(true);
    try {
      const ref = doc(collection(db, 'users', currentUser.uid, 'models'));
      await setDoc(ref, {
        name: modelName,
        layers: layers,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setMessage('Model saved!');
      setModelName('');

      // reload models
      loadUserModels();
    } catch (error) {
      console.error('Save model error:', error);
      setMessage('Error saving model');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverwriteModel = async (id: string) => {
    if (!currentUser) return;

    try {
      const ref = doc(db, 'users', currentUser.uid, 'models', id);

      await updateDoc(ref, {
        layers,
        updatedAt: serverTimestamp()
      });

      const name = savedModels.find((m) => m.id === id)?.name;

      setMessage(`Model "${name}" overwritten!`);
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error(error);
      setMessage('Error overwriting model');
    }
  };

  const startEditing = (model: SavedModel) => {
    setEditingModelId(model.id);
    setEditedName(model.name);
  };

  const saveEditing = async (id: string) => {
    if (editedName.trim()) {
      await handleEditModelName(id, editedName.trim());
    }
    setEditingModelId(null);
    setEditedName('');
  };

  const cancelEditing = () => {
    setEditingModelId(null);
    setEditedName('');
  };

  return (
    <div className="w-full p-4 bg-[#1e2538] rounded-md border border-[#374151] shadow-2xl">
      <h3 className="text-xl font-semibold text-white mb-3">Models</h3>

      {/* Save New Model */}
      <div className="mb-6 p-4 bg-[#141a29] rounded-md border border-[#2d3748]">
        <h4 className="text-lg font-semibold text-white mb-2">Save Model</h4>

        <input
          type="text"
          placeholder="Enter model name"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="w-full px-3 py-1.5 bg-[#1a1a1a] text-white rounded-md border border-transparent focus:border-purple-400 mb-2"
        />

        <button
          onClick={saveNewModel}
          disabled={isSaving}
          className="px-4 py-2 bg-[#334155] hover:bg-[#3f4f62] text-white rounded-lg"
        >
          {isSaving ? 'Saving...' : 'Save Model'}
        </button>
      </div>

      {message && (
        <p className={`text-sm mb-3 ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}

      {/* Load models */}
      {isLoading ? (
        <p className="text-gray-400">Loading models...</p>
      ) : savedModels.length === 0 ? (
        <p className="text-gray-400">No saved models yet.</p>
      ) : (
        <div className="space-y-3">
          {savedModels.map((m) => (
            <div
              key={m.id}
              className="flex justify-between items-center p-4 bg-[#0f0f0f] border border-[#4a6380]/40 rounded-lg shadow"
            >
              {/* Name + Input */}
              <div className="flex-1">
                {editingModelId === m.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="px-3 py-1 bg-[#1e2538] border border-purple-500 rounded text-white"
                      autoFocus
                    />
                    <button onClick={() => saveEditing(m.id)} className="text-green-400">✔</button>
                    <button onClick={cancelEditing} className="text-red-400">✖</button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <strong className="text-[#a78bfa]">{m.name}</strong>
                    <button
                      onClick={() => startEditing(m)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      ✎
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  {m.layers.length} layers • {m.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {editingModelId !== m.id && (
                  <>
                    <button
                      onClick={() => handleDeleteModel(m.id)}
                      className="p-2 bg-red-900/40 border border-red-500 rounded-lg text-white"
                    >
                      🗑
                    </button>

                    <button
                      onClick={() => handleOverwriteModel(m.id)}
                      className="px-3 py-2 bg-[#334155] rounded text-white"
                    >
                      Overwrite
                    </button>

                    <button
                      onClick={() => handleLoadModel(m)}
                      className="px-3 py-2 bg-[#334155] rounded text-white"
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
