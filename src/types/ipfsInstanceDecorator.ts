import { IPFS } from "ipfs";
import { IPFSDecorator } from "../classes";

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