import React from 'react';
import ReactDOM from 'react-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { MainApp } from './App';

ReactDOM.render(
  <React.StrictMode>
    <SettingsProvider>
      <MainApp />
    </SettingsProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
