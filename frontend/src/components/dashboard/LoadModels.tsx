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
      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
        <h3>Load Models</h3>
        <p>Please log in to view your saved models</p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Your Models</h3>
        <button
          onClick={loadUserModels}
          disabled={isLoading}
          style={{
            padding: '6px 12px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {message && (
        <p style={{ color: message.includes('Error') ? 'red' : 'green', marginBottom: '1rem' }}>
          {message}
        </p>
      )}

      {isLoading ? (
        <p>Loading your models...</p>
      ) : savedModels.length === 0 ? (
        <p>No saved models found</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {savedModels.map((model) => (
            <div
              key={model.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong>{model.name}</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                  {model.layers.length} layers • 
                  {model.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                </p>
              </div>
              <button
                onClick={() => handleDeleteModel(model.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '8px' // Add some spacing
                }}
              >
                Delete
              </button>
              <button
                onClick={() => handleLoadModel(model)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Load
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}