import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Layer } from '../types/model'; 

interface ModelContextType {
    layers: Layer[];
    setLayers: (layers: Layer[]) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
    const [layers, setLayers] = useState<Layer[]>([
        { id: 1, type: 'Convolutional', outputChannels: 32, kernelSize: 3, activation: 'ReLU' },
        { id: 2, type: 'Fully Connected', units: 128, activation: 'ReLU' },
        { id: 3, type: 'Fully Connected', units: 10, activation: 'Softmax' },
    ]);

    return(
        <ModelContext.Provider value={{ layers, setLayers }}>
            {children}
        </ModelContext.Provider>
    )
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
    return context;
}