import IPFS from "ipfs-core/src/components"
import { API } from "ipfs-core-types/src/files"
import { concat } from "uint8arrays"
import { IPFSEntry } from "ipfs-core-types/src/root"

/**
 * Class for easy operation with Uin8Array data
 */

 export class IPFSFileData {
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

    ls = async (path: string): Promise<[IPFSEntry[] | null, Error | null | unknown]> => {
        return new Promise((resolve) => {

            try {
                (async () => {
                    try {
                        const list: IPFSEntry[] = []
                        for await (const file of this.original.ls(path)) {
                            list.push(file)
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

    read = async (cid: string): Promise<[IPFSFileData | null, Error | null | unknown]> => {
        return new Promise((resolve) => {
            try {
                (async () => {
                    try {
                        const content: Uint8Array[] = []
                        for await (const chunk of this.original.cat(cid)) {
                            content.push(chunk)
                        }
                        resolve([new IPFSFileData(concat(content)), null])
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
