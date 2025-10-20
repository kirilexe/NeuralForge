// types/model.ts

export interface Layer {
  id: number;
  type: 'Input' | 'Convolutional' | 'Fully Connected' | 'Output' | 'Pooling';
  
  // Input layer properties
  inputShape?: [number, number, number]; // [width, height, channels]
  
  // Convolutional layer properties
  outputChannels?: number;
  kernelSize?: number;
  stride?: number;
  padding?: number;
  
  // Fully Connected/Output layer properties
  units?: number;
  
  // Activation functions
  activation?: 'ReLU' | 'Sigmoid' | 'Tanh' | 'Softmax' | 'Linear';
  
  // Pooling layer properties
  poolSize?: number;
  poolType?: 'Max' | 'Average';
}