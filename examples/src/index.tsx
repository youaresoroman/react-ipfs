import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { IPFSProvider } from "@lib"

ReactDOM.render(
  <React.StrictMode>
    <IPFSProvider fallback={<>LOADiNG</>}>
      <App />
    </IPFSProvider>
  </React.StrictMode>,
  document.getElementById('root')
);