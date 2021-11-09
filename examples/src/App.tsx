import React from 'react';
import '@/App.css';
import { useIPFS } from '@lib';

function App() {
  const { ipfs } = useIPFS()

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={(e) => {
          e.preventDefault()
          console.log(ipfs)
        }}>
          Click to log to console
        </button>
      </header>
    </div>
  );
}

export default App;
