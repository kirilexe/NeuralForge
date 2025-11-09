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
        <div className="w-full p-4 bg-[#1e2538] rounded-md border border-[#374151] shadow-2xl">
            <h3>Save Model</h3>
            <div>
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
            {message && (
                <p style={{ color: message.includes('Error') ? 'red' : 'green' }}>
                    {message}
                </p>
            )}
        </div>
    );
}