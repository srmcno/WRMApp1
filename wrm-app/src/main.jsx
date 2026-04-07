import React from 'react';
import ReactDOM from 'react-dom/client';
import Shell from './Shell.jsx';
import './shared/theme.css';
import { runLegacyMigration } from './shared/storage.js';

runLegacyMigration();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>
);
