// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client'; // No need for ReactDOM
import App from './App';
import './index.css'; // Import your global styles

// Find the root element manually
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement); // Create a React root manually
  root.render(<App />);
}
