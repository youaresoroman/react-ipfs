import React, { createContext, ReactChild, useEffect, useState } from "react";
import { IPFSContext } from "../types/IPFSContext";
import { useStartIPFS } from "../hooks/useStartIPFS";
import { Decorator } from "../classes";

export const IPFSGlobalContext = createContext<IPFSContext>(new Decorator(null));

export const IPFSProvider = ({ children, fallback }: { children: ReactChild, fallback?: ReactChild }) => {
    const ipfs = useStartIPFS()
    const [instance, setInstance] = useState<Decorator>(new Decorator(null))

    useEffect(() => {
        if (ipfs) { setInstance(new Decorator(ipfs)) }
    }, [ipfs])

    return (
        <IPFSGlobalContext.Provider value={instance}>
            {fallback && ipfs === null ? fallback : children}
        </IPFSGlobalContext.Provider>
    )
}