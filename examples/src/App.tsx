import React from 'react';
import '@/App.css';
import { useIPFS } from '@lib';

function App() {
  const ipfs = useIPFS()

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={(e) => {
          e.preventDefault();
          ipfs.stop();
        }}>
          Stop
        </button>
        <button onClick={(e) => {
          e.preventDefault();
          ipfs.start();
        }}>
          Start
        </button>
        <button onClick={(e) => {
          e.preventDefault();
          ipfs.id().then(console.log);
        }}>
          ID
        </button>
        <button onClick={(e) => {
          e.preventDefault();
          ipfs.cat("QmUtR5T9WxaMW9Q4J47RXQU4n7hRvsn8beewhLEMcg4ahR").then(console.log);
        }}>
          cat
        </button>
        <button onClick={(e) => {
          e.preventDefault();
          ipfs.add({ content: "Hello world" }).then(console.log);
        }}>
          add
        </button>
      </header>
    </div >
  );
}

export default App;
