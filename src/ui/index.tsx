import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

if (window.WebSocket) {
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function(url: string, protocols?: string | string[]) {
    if (url.includes('ws://localhost:3000/ws')) {
      console.log('WebSocket connection to localhost:3000/ws disabled in development');
      return {} as WebSocket;
    }
    return new originalWebSocket(url, protocols);
  } as any;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
