import { useEffect, useState } from "react";
import { useIpfs } from "./lib";

function App() {
  const ipfs = useIpfs();
  const [id, setId] = useState<string | null>(null);
  const [version, setVersion] = useState<string>("");

  const getVersion = () =>
    ipfs.version().then((version) => setVersion(version.version));

  useEffect(() => {
    ipfs.id().then((id) => setId(id.id.toString()));
  });

  return (
    <div className="App">
      <h1>React + IPFS</h1>
      <div className="card">
        <button onClick={getVersion}>
          {version.length ? version : "Click to get IPFS version"}
        </button>
      </div>
      <p>IPFS ID: {id}</p>
      <p className="read-the-docs">
        Click{" "}
        <a href="https://github.com/ipfs/js-ipfs/tree/master/docs/core-api">
          here
        </a>{" "}
        learn more about the IPFS Core API.
      </p>
    </div>
  );
}

export default App;
