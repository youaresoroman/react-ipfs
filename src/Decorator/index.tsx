import IPFS from "ipfs-core/src/components"
import { API } from "ipfs-core-types/src/files"
import {concat} from "uint8arrays"
//import { File } from "ipfs-core-types/src/root"

export type IpfsFile = {
    name: string,
    type: "file" | "dir";
    size: number;
    hash: string;
}

export class ipfsFileData {
    content: Uint8Array;

    constructor(content: Uint8Array) {
        this.content = content
    }

    toString() {
        const decode = new TextDecoder()
        return decode.decode(this.content)
    }

    toJSON() {
        return JSON.parse(this.toString())
    }

    toBlob() {
        return new Blob([this.content])
    }

    toObjectURL() {
        return URL.createObjectURL(this.toBlob())
    }
}

export class IPFSDecorator {
    original: IPFS;
    files: API;

    constructor(ipfs: IPFS) {
        this.original = ipfs
        this.files = this.original.files
    }

    ls = async (path: string): Promise<[IpfsFile[] | null, Error | null]> => {
        return new Promise((resolve) => {

            try {
                (async () => {
                    try {
                        const list: IpfsFile[] = []
                        for await (const file of this.original.ls(path)) {
                            const { name, type, size, cid } = file
                            list.push({
                                name,
                                type,
                                size,
                                hash: cid.toString()
                            })
                        }
                        resolve([list, null])
                    } catch (error) {
                        resolve([null, error])
                    }
                })()

            } catch (error) {
                resolve([null, error])
            }
        })
    }

    read = async (cid: string): Promise<[ipfsFileData | null, Error | null]> => {
        return new Promise((resolve) => {
            try {
                (async () => {
                    try {
                        const content: Uint8Array[] = []
                        for await (const chunk of this.original.cat(cid)) {
                            content.push(chunk)
                        }
                        resolve([new ipfsFileData(concat(content)), null])
                    } catch (error) {
                        resolve([null, error])
                    }
                })()
            } catch (error) {
                resolve([null, error])
            }

        })
    }
}
