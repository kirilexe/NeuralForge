import React, { useState, useEffect } from 'react';
import { useModel } from '../../contexts/ModelContext';
//@ts-ignore
import { useAuth } from '../../contexts/authContext/index';
import { db } from '../../firebase/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';

export default function DefaultModels() {
  const { setLayers, layers } = useModel();
  const { currentUser, userRole } = useAuth();
  const [defaultModels, setDefaultModels] = useState<any[]>([]);
  const [modelName, setModelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

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
              <div>
                <strong className="text-[#a78bfa] text-base font-medium block">{model.name}</strong>
                <p className="mt-1 text-xs text-gray-400">
                  {model.layers.length} layers • {model.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                </p>
              </div>
              <div className="flex space-x-2">
                {userRole === "admin" && (
                  <button
                    onClick={() => handleDeleteDefault(model.id)}
                    className="flex items-center justify-center p-2 text-white bg-red-900/40 border border-red-500 rounded-lg hover:bg-red-700/60 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
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
