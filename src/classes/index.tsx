import IPFS from "ipfs-core/src/components"
import { API } from "ipfs-core-types/src/files"
import { concat } from "uint8arrays"
import { IPFSEntry } from "ipfs-core-types/src/root"

export function getMime(extension: string) {
    return (
        ({
            "svg": "image/svg+xml",
            "webp": "image/webp",
            "png": "image/png",
            "jpeg": "image/jpeg",
            "jpg": "image/jpeg",
            "jfif": "image/jpeg",
            "pjpeg": "image/jpeg",
            "pjp": "image/jpeg",
            "gif": "image/gif",
            "avif": "image/avif",
            "apng": "image/apng"
        } as any)[extension] || "")
}

export function getExtension(url: string) {
    return url.slice((url.lastIndexOf(".") - 1 >>> 0) + 2)
}

/**
 * Class for easy operation with Uin8Array data
 */

export class IPFSFileData {
    content: Uint8Array;
    fileName: string;

    constructor(content: Uint8Array, fileName: string) {
        this.content = content
        this.fileName = fileName
    }

    toFile() {
        const filename = this.fileName.split('/').pop() || "image"
        const extension = getExtension(this.fileName)
        const type = getMime(extension)
        return new File([this.toBlob()], filename, { type })
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

    toObjectURL(blob?: Blob | File) {
        return URL.createObjectURL(blob ? blob : this.toBlob())
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
                        resolve([new IPFSFileData(concat(content), cid), null])
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