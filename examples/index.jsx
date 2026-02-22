<<<<<<< HEAD
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('app');
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
=======
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Create a root
const container = document.getElementById('app')
const root = createRoot(container)

// Render the app directly without AppContainer
root.render(<App />)

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./App', () => {
    // When App is updated, re-render
    const NextApp = require('./App').default
    root.render(<NextApp />)
  })
}
>>>>>>> pr-182
