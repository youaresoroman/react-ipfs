import IPFS from "ipfs-core/src/components"
import { IPFSDecorator } from "./classes"

export type ipfsInstance = [
    {
        ipfs: IPFS | undefined,
        isIpfsReady: boolean
    },
    (value: {
        ipfs: IPFS | undefined,
        isIpfsReady: boolean
    }) => void,
    () => void
]

export type ipfsInstanceDecorator = [
    {
        ipfs: IPFS | undefined,
        isIpfsReady: boolean
    },
    (value: {
        ipfs: IPFSDecorator | undefined,
        isIpfsReady: boolean
    }) => void,
    () => void
]