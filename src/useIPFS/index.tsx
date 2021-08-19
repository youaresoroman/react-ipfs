//// eslint-disable
import Ipfs from "ipfs"
import { useEffect, useState } from "react"

let ipfs: any = null

export default function useIpfsFactory() {
    const [isIpfsReady, setIpfsReady] = useState(Boolean(ipfs))
    const [ipfsInitError, setIpfsInitError] = useState<Error | null>(null)

    useEffect(() => {
        startIpfs()
        return function cleanup() {
            if (ipfs && ipfs.stop) {
                console.log("Stopping IPFS")
                ipfs.stop().catch((err: Error) => setIpfsInitError(err))
                ipfs = null
                setIpfsReady(false)
            }
        }
    }, [])

    async function startIpfs() {
        if (!ipfs) {
            try {
                console.log("%cIPFS Started", "color: green")
                ipfs = await Ipfs.create()
            } catch (error) {
                ipfs = null
                setIpfsInitError(error)
            }
        }

        setIpfsReady(Boolean(ipfs))
    }

    return { ipfs, isIpfsReady, ipfsInitError }
}
