import React from 'react';
import { createRoot } from 'react-dom/client';

// @ts-ignore
import { App } from './app';
// import './i18n';

const container = document.querySelector('#root') as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <React.Suspense fallback="loading">
      <App />
    </React.Suspense>
  </React.StrictMode>,
);
