import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//@ts-ignore
import { AuthProvider } from './contexts/authContext/index';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </AuthProvider>
)
