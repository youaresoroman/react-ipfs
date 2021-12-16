import { useEffect, useState } from "react";
import { IPFS } from "ipfs";
import Ipfs from "ipfs"

export const useStartIPFS = () => {
    const [ipfs, setIpfs] = useState<IPFS | null>(null)

    const startIpfs = async () => {
        if (!ipfs) {
            try {
                console.log("%cIPFS Started", "color: green")
                setIpfs(await Ipfs.create())
            } catch (error) {
                setIpfs(null)
                console.log(`%c${error}`, "color:red")
            }
        }
    }

    useEffect(() => {
        startIpfs()
        return function cleanup() {
            if (ipfs && ipfs.stop) {
                console.log("Stopping IPFS")
                ipfs.stop().catch((error: Error) => console.log(`%c${error}`, "color:red"))
                setIpfs(null)
            }
        }
    }, [])

    return ipfs
}