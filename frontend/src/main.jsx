import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ReservaProvider } from './context/ReservaContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ReservaProvider>
          <App />
        </ReservaProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);