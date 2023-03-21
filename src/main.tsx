import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { IPFSProvider } from "./lib";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <IPFSProvider fallback={<></>}>
      <App />
    </IPFSProvider>
  </React.StrictMode>
);
