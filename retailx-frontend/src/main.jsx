import React from 'react';             // React import
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';                  // Tailwind / global styles

// Entry point
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
