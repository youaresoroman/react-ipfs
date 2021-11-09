import { IPFS } from "ipfs";

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