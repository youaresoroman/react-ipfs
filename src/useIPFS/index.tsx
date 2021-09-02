//// eslint-disable
import Ipfs from "ipfs"
import { useEffect, useState } from "react"
import { useStore } from "react-context-hook"
import IPFS from "ipfs-core/src/components"
import {IPFSDecorator} from "../Decorator"

let ipfs: IPFS | null = null

type ipfsInstance = [
    {
        ipfs: IPFS | undefined,
        isIpfsReady: boolean,
        ipfsInitError: Error | null
    },
    (value: {
        ipfs: IPFS | undefined,
        isIpfsReady: boolean,
        ipfsInitError: Error | null
    }) => void,
    () => void
]

type ipfsInstanceDecorator = [
    {
        ipfs: IPFS | undefined,
        isIpfsReady: boolean,
        ipfsInitError: Error | null
    },
    (value: {
        ipfs: IPFSDecorator | undefined,
        isIpfsReady: boolean,
        ipfsInitError: Error | null
    }) => void,
    () => void
]

export function startIPFSInstance(verbose: "silent" | "info" | "full" = "info") {
    const [isIpfsReady, setIpfsReady] = useState(Boolean(ipfs))
    const [ipfsInitError, setIpfsInitError] = useState<Error | null>(null)
    const [,setInstance] = useStore('ipfsInstance', {
        ipfs: undefined,
        isIpfsReady: false,
        ipfsInitError: null
    }) as ipfsInstance;

    useEffect(() => {
        startIpfs()
        return function cleanup() {
            if (ipfs && ipfs.stop) {
                verbose == "info" || verbose == "full" ? console.log("Stopping IPFS") : null
                ipfs.stop().catch((err: Error) => setIpfsInitError(err))
                ipfs = null
                setIpfsReady(false)
            }
        }
    }, [])

    useEffect(() => {
        if (ipfs) {
            setInstance({
                ipfs,
                isIpfsReady,
                ipfsInitError
            })
        }
    }, [isIpfsReady, ipfsInitError])

    async function startIpfs() {
        if (!ipfs) {
            try {
                verbose == "info" || verbose == "full" ? console.log("%cIPFS Started", "color: green"): null
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

export function useIPFS() {
    const [ipfs, setIPFS] = useState<IPFSDecorator>()
    const [isIpfsReady, setIpfsReady] = useState(false)
    const [ipfsInitError, setIpfsInitError] = useState<Error | null>(null)
    const [instance] = useStore('ipfsInstance', {
        ipfs: undefined,
        isIpfsReady: false,
        ipfsInitError: null
    }) as ipfsInstanceDecorator;

    useEffect(() => {
        if (instance.isIpfsReady && instance.ipfs) {
            setIPFS(new IPFSDecorator(instance.ipfs))
            setIpfsReady(instance.isIpfsReady)
            setIpfsInitError(instance.ipfsInitError)
        }
    }, [instance])

    return { ipfs, isIpfsReady, ipfsInitError }
}
