import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
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

const deployTarget = import.meta.env.VITE_DEPLOY_TARGET;
const Router = deployTarget === 'github-pages' ? HashRouter : BrowserRouter;
const browserBasename = deployTarget === 'github-pages' ? undefined : import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router basename={browserBasename} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <App />
    </Router>
  </React.StrictMode>,
);
