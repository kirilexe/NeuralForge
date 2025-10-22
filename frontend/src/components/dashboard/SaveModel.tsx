import React, { useState } from 'react';
import { useModel } from '../../contexts/ModelContext';
//@ts-ignore
import { useAuth } from '../../contexts/authContext/index';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export default function SaveModel() {
    const { layers } = useModel();
    const { currentUser } = useAuth();
    const [modelName, setModelName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

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
            //@ts-ignore
            await setDoc(modelRef, {
                name: modelName,
                layers: layers,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            setMessage('Model saved successfully!');
            setModelName('');

        } catch (error) {
            console.error('Error saving model: ', error);
            setMessage('Error saving model');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <h3>Save Model</h3>
            <div style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Enter model name"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        width: '200px',
                        marginRight: '8px'
                    }}
                />
                <button
                    onClick={handleSave}
                    disabled={isSaving || !modelName.trim()}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isSaving ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isSaving ? 'Saving...' : 'Save Model'}
                </button>
            </div>
            {message && (
                <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>
                    {message}
                </p>
            )}
        </div>
    );
}