import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App.tsx'
import { OpenAPI } from './api'; // adjust path to match your project

OpenAPI.BASE = import.meta.env.VITE_API_URL;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
