import { PropsWithChildren, ReactElement, createContext } from "react";
import * as Ipfs from "ipfs-core";
import type {} from "ipfs-core-types"; // https://github.com/microsoft/TypeScript/issues/47663
import { useStartInstance } from "./useStartInstance";

export const IpfsContext = createContext<Ipfs.IPFS>({ } as Ipfs.IPFS);

export const IPFSProvider = ({
  children,
  fallback,
}: PropsWithChildren<{
  fallback: ReactElement;
}>) => {
  const ipfs = useStartInstance();

  return ipfs !== null ? (
    <IpfsContext.Provider value={ipfs}>
      {children}
    </IpfsContext.Provider>
  ) : (
    fallback
  );
};
