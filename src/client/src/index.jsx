import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppNew from './AppNew.jsx';
import reportWebVitals from './reportWebVitals.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppNew />
  </React.StrictMode>
);

reportWebVitals();
