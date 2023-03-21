import { useContext } from "react";
import * as Ipfs from "ipfs-core";
import type {} from "ipfs-core-types"; // https://github.com/microsoft/TypeScript/issues/47663
import { IpfsContext } from "./IpfsProvider";

export const useIpfs = (): Ipfs.IPFS => {
    const context = useContext<Ipfs.IPFS>(IpfsContext);

    if (context === undefined) {
        throw new Error('The useIPFS hook must be used within a IPFSGlobalContext.Provider')
    } else {
        return context as Ipfs.IPFS
    }
}