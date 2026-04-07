import React from 'react';
import ReactDOM from 'react-dom/client';
import Shell from './Shell.jsx';
import './shared/theme.css';
import { runLegacyMigration } from './shared/storage.js';

runLegacyMigration();

function mount() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Shell />
    </React.StrictMode>
  );
}

// Defend against the inlined classic <script> running before #root
// exists. With the single-file IIFE build the bundle is moved to the
// end of <body> by the closeBundle plugin in vite.config.js, but this
// guard makes the app safe regardless of where the script ends up.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}
