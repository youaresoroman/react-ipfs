import React, { createContext, ReactChild, useContext, useEffect, useState } from "react";
import Ipfs from "ipfs"
import IPFS from "ipfs-core/src/components";
import { IPFSDecorator } from "../classes";

let ipfsOriginal: IPFS | null = null

export type GlobalIPFSContext = {
    ipfs?: IPFSDecorator,
    isIpfsReady: boolean
}
export const MyGlobalContext = createContext<GlobalIPFSContext>({
    isIpfsReady: false
})

export const IPFSProvider = ({ children, verbose = "info" }: { children: ReactChild, verbose: "silent" | "info" | "full" }) => {
    const [isIpfsReady, setIpfsReady] = useState(Boolean(ipfsOriginal))
    const [ipfsDecorated, setIpfsDecorated] = useState<IPFSDecorator | undefined>(undefined)

    const startIpfs = async () => {
        if (!ipfsOriginal) {
            try {
                verbose == "info" || verbose == "full" ? console.log("%cIPFS Started", "color: green") : null
                ipfsOriginal = await Ipfs.create()
            } catch (error) {
                ipfsOriginal = null
                verbose == "full" ? console.log(`%c${error}`, "color:red") : null
            }
        }
        setIpfsReady(Boolean(ipfsOriginal))
    }

    useEffect(() => {
        startIpfs()
        return function cleanup() {
            if (ipfsOriginal && ipfsOriginal.stop) {
                verbose == "info" || verbose == "full" ? console.log("Stopping IPFS") : null
                ipfsOriginal.stop().catch((error: Error) => verbose == "full" ? console.log(`%c${error}`, "color:red") : null)
                ipfsOriginal = null
                setIpfsReady(false)
            }
        }
    }, [])

    useEffect(() => {
        if (ipfsOriginal) {
            setIpfsDecorated(new IPFSDecorator(ipfsOriginal, verbose))
        }
    }, [isIpfsReady])

    return (
        <MyGlobalContext.Provider value={{
            ipfs: ipfsDecorated,
            isIpfsReady
        }}>
            {children}
        </MyGlobalContext.Provider>
    )
}

export const useIPFS = (): GlobalIPFSContext => {
    const { ipfs, isIpfsReady } = useContext<GlobalIPFSContext>(MyGlobalContext);

    return { ipfs, isIpfsReady } as GlobalIPFSContext
}