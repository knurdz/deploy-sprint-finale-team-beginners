import React from 'react';
import ReactDOM from 'react-dom/client';
import { initSentry } from './sentry';
import { SentryTestPage } from './pages/SentryTestPage';
import './styles.css';

initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryTestPage />
  </React.StrictMode>,
);
