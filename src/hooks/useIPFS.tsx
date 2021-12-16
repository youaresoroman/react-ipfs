import { useContext } from "react";
import { IPFSGlobalContext } from "../context/ipfs";
import { IPFSContext } from "../types/IPFSContext";

export const useIPFS = (): IPFSContext => {
    const context = useContext<IPFSContext>(IPFSGlobalContext);

    if (context === undefined) {
        throw new Error('The useIPFS hook must be used within a IPFSGlobalContext.Provider')
    } else {
        return context as IPFSContext
    }
}