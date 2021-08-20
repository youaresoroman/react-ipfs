//// eslint-disable
import Ipfs from "ipfs"
import { useEffect, useState } from "react"
import { useStore } from "react-context-hook"

let ipfs: any = null

type ipfsInstance = [
    {
        ipfs: any,
        isIpfsReady: boolean,
        ipfsInitError: Error | null
    },
    (value: unknown) => void,
    () => void
]

export default function useIpfsFactory() {
    const [isIpfsReady, setIpfsReady] = useState(Boolean(ipfs))
    const [ipfsInitError, setIpfsInitError] = useState<Error | null>(null)
    const [instance, setInstance] = useStore('ipfsInstance') as ipfsInstance;

    useEffect(() => {
        if (instance && instance.isIpfsReady) {
            ipfs = instance.ipfs
            setIpfsReady(Boolean(ipfs))
            setIpfsInitError(instance.ipfsInitError)
        } else {
            startIpfs()
        }
        // return function cleanup() {
        //     if (ipfs && ipfs.stop) {
        //         console.log("Stopping IPFS")
        //         ipfs.stop().catch((err: Error) => setIpfsInitError(err))
        //         ipfs = null
        //         setIpfsReady(false)
        //     }
        // }
    }, [instance])

    async function startIpfs() {
        try {
            console.log("%cIPFS Started", "color: green")
            await Ipfs.create()
                .then((ipfsInstance) => {
                    ipfs == ipfsInstance
                    setInstance({ ipfs, ipfsInitError, isIpfsReady })
                })
        } catch (error) {
            ipfs = null
            setIpfsInitError(error)
        }
        setIpfsReady(Boolean(ipfs))
    }

    return { ipfs, isIpfsReady, ipfsInitError }
}
