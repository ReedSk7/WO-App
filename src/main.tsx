import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { STORAGE_KEYS } from './storage/local';
import './index.css';

try {
  const themeRaw = window.localStorage.getItem(STORAGE_KEYS.theme);
  const densityRaw = window.localStorage.getItem(STORAGE_KEYS.density);
  const theme = themeRaw ? JSON.parse(themeRaw) : 'light';
  const density = densityRaw ? JSON.parse(densityRaw) : 'comfortable';
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.density = density;
} catch {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
