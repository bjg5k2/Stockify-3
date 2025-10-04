
import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Explicitly import App.tsx to resolve the "not a module" error, which was caused by placeholder content in App.tsx. Also added StrictMode for best practices.
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);