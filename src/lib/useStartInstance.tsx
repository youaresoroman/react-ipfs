import { useEffect, useRef, useState } from "react";
import * as Ipfs from "ipfs-core";
import type {} from "ipfs-core-types"; // https://github.com/microsoft/TypeScript/issues/47663

export const useStartInstance = () => {
  const isStarting = useRef(false);
  const [ipfs, setIpfs] = useState<Ipfs.IPFS | null>(null);

  const startIpfs = async () => {
    if (!ipfs) {
      try {
        console.log("%cIPFS Started", "color: green");
        isStarting.current = true;
        setIpfs(await Ipfs.create());
      } catch (error) {
        setIpfs(null);
        isStarting.current = false;
        console.log(`%c${error}`, "color:red");
      }
    }
  };

  useEffect(() => {
    if (!isStarting.current) {
      startIpfs();
    }
    return function cleanup() {
      if (ipfs && ipfs.stop) {
        isStarting.current = false;
        console.log("Stopping IPFS");
        ipfs
          .stop()
          .catch((error: Error) => console.log(`%c${error}`, "color:red"));
        setIpfs(null);
      }
    };
  }, []);

  return ipfs;
};
