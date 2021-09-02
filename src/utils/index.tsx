
import { useEffect } from "react";
import { useState } from "react";
import { concat } from "uint8arrays";
import { useIPFS } from "..";

export type IpfsFile = {
    name: string,
    type: string;
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

export const useIPFSFolderState = (path: string): [
    string,
    {
        ls: (path?: string) => Promise<[IpfsFile[] | null, Error | null]>,
        getHash: (path: string) => Promise<[string | null, Error | null]>,
        read: (path: string) => Promise<[ipfsFileData | null, Error | null]>,
        write: (fileName: string, content: string | Uint8Array | Blob | AsyncIterable<Uint8Array> | Iterable<Uint8Array>) => Promise<[string | null, Error | null]>,
        writeAll: (list: { fileName: string, content: string | Uint8Array | Blob | AsyncIterable<Uint8Array> | Iterable<Uint8Array> }[]) => Promise<[boolean, Error | null]>,
        rm: (path?: string) => Promise<[boolean | null, Error | null]>,
        mv: (originalPath: string, pathToMove: string) => Promise<[boolean, Error | null]>
    }
] => {

    const [folderHash, setFolderHash] = useState<string>("");
    const { ipfs, isIpfsReady } = useIPFS();

    useEffect(() => {
        if (isIpfsReady && ipfs) {
            ipfs.files.stat(path)
                .then(async (data: any) => {
                    setFolderHash(data?.cid.string)

                    if (data.type != "directory") {
                        new Error("Path is a file")
                    }
                })
                .catch(() => {
                    ipfs.files.mkdir(path, {
                        parents: true
                    })
                        .then(() => {
                            ipfs.files.stat(path)
                                .then(async (data: any) => {
                                    setFolderHash(data?.cid.string)
                                })
                                .catch((error: Error) => {
                                    console.error(error);
                                })
                        })
                        .catch((error: Error) => {
                            console.error(error);
                        })
                })
        }
        return
    }, [isIpfsReady])


    const read = async (pathToRead: string): Promise<[ipfsFileData | null, Error | null]> => {
        return new Promise((resolve) => {
            const actualPath = `${path}${pathToRead}`
            if (isIpfsReady && ipfs) {
                ipfs.files.stat(actualPath)
                    .then(async () => {
                        const chunks: Uint8Array[] = []
                        for await (const chunk of ipfs.files.read(actualPath)) {
                            chunks.push(chunk)
                        }
                        resolve([new ipfsFileData(concat(chunks)), null])
                    })
                    .catch((error: Error) => {
                        resolve([null, error]);
                    })
            } else {
                resolve([null, new Error("Ipfs instance not started yet")]);
            }

        })
    }

    const getHash = async (pathToRead: string): Promise<[string | null, Error | null]> => {
        return new Promise((resolve) => {
            if (isIpfsReady && ipfs) {
                const actualPath = `${path}${pathToRead}`
                ipfs.files.stat(actualPath)
                    .then(async (data: any) => {
                        resolve([data?.cid.string, null])
                    })
                    .catch((error: Error) => {
                        resolve([null, error]);
                    })
            } else {
                resolve([null, new Error("Ipfs instance not started yet")]);
            }
        })
    }

    const mv = async (originalPath: string, pathToMove: string): Promise<[boolean, Error | null]> => {
        return new Promise((resolve) => {
            if (isIpfsReady && ipfs) {
                const actualOriginalPath = `${path}${originalPath}`
                const actualPathToMove = `${path}${pathToMove}`

                ipfs.files.mv(actualOriginalPath, actualPathToMove, { parents: true }).then(() => {
                    resolve([true, null]);
                })
                    .catch((error: Error) => {
                        resolve([false, error]);
                    })

            } else {
                resolve([false, new Error("Ipfs instance not started yet")]);
            }
        })
    }

    const ls = async (pathToList?: string): Promise<[IpfsFile[] | null, Error | null]> => {
        return new Promise((resolve) => {
            if (isIpfsReady && ipfs) {
                const actualPath = `${path}${pathToList ? pathToList : ""}`
                ipfs.files.stat(actualPath)
                    .then(async (data: any) => {
                        const list: IpfsFile[] = []

                        list.push({
                            name: "parent",
                            type: "directory",
                            size: 0,
                            hash: data?.cid.string
                        })

                        for await (const file of ipfs.files.ls(actualPath)) {
                            const { name, type, size, cid } = file
                            list.push({
                                name,
                                type,
                                size,
                                hash: cid.toString()
                            })
                        }
                        resolve([list, null])
                    })
                    .catch((error: Error) => {
                        resolve([null, error]);
                    })
            } else {
                resolve([null, new Error("Ipfs instance not started yet")]);
            }
        })
    }

    const write = (fileName: string, content: string | Uint8Array | Blob | AsyncIterable<Uint8Array> | Iterable<Uint8Array>): Promise<[string | null, Error | null]> => {
        return new Promise((resolve) => {
            if (isIpfsReady && ipfs) {
                const file = `${path}${fileName}`
                ipfs.files.stat(path)
                    .then(async () => {
                        rm(file)
                            .then(() => {
                                ipfs.files.write(file, content, {
                                    parents: true,
                                    create: true
                                })
                                    .then(() => {
                                        ipfs.files.stat(path)
                                            .then(async (data: any) => {
                                                setFolderHash(data?.cid.string)

                                                ipfs.files.stat(file)
                                                    .then(async (data: any) => {
                                                        resolve([data?.cid.string, null])
                                                    })
                                                    .catch((error: Error) => {
                                                        resolve([null, error]);
                                                    })
                                            })
                                            .catch((error: Error) => {
                                                resolve([null, error]);
                                            })
                                    })
                                    .catch((error: Error) => {
                                        resolve([null, error]);
                                    })
                            })
                    })
                    .catch((error: Error) => {
                        resolve([null, error]);
                    })
            } else {
                resolve([null, new Error("Ipfs instance not started yet")]);
            }
        })

    }

    const writeAll = async (list: { fileName: string, content: string | Uint8Array | Blob | AsyncIterable<Uint8Array> | Iterable<Uint8Array> }[]): Promise<[boolean, Error | null]> => {
        return new Promise((resolve) => {
            if (isIpfsReady && ipfs) {
                /* eslint-disable */
                const promises: any[] = []
                /* eslint-enable */

                list.forEach(async (data) => {
                    promises.push(new Promise((resolve, reject) => {
                        (async () => {
                            const { fileName, content } = data
                            const [res, error] = await write(fileName, content)
                            res ? resolve(res) : reject(error)
                        })()
                    }))
                })

                Promise.all(promises)
                    .then(() => {
                        resolve([true, null])
                    })
                    .catch((error) => {
                        resolve([false, error])
                    });
            } else {
                resolve([false, new Error("Ipfs instance not started yet")]);
            }
        })
    }

    const rm = (pathToRemove?: string): Promise<[boolean | null, Error | null]> => {
        return new Promise((resolve) => {
            if (isIpfsReady && ipfs) {
                if (pathToRemove) {
                    ipfs.files.rm(`${path}/${pathToRemove}`, { recursive: true })
                        .then(() => {
                            ipfs.files.stat(path)
                                /* eslint-disable @typescript-eslint/no-explicit-any */
                                .then(async (data: any) => {
                                    setFolderHash(data?.cid.string)
                                    resolve([true, null])
                                })
                                .catch((error: Error) => {
                                    resolve([null, error]);
                                })
                        })
                        .catch((error: Error) => {
                            resolve([null, error]);
                        })
                } else {
                    ipfs.files.rm(path, { recursive: true })
                        .then(() => {
                            ipfs.files.stat(path)
                                .then(() => {
                                    resolve([null, new Error("Remove Failed")]);
                                })
                                .catch(() => {
                                    setFolderHash("")
                                    resolve([true, null])

                                })
                        })
                        .catch((error: Error) => {
                            resolve([null, error]);
                        })
                }
            } else {
                resolve([null, new Error("Ipfs instance not started yet")]);
            }
        })
    }

    return [
        folderHash,
        {
            getHash,
            ls,
            read,
            write,
            writeAll,
            rm,
            mv
        }
    ]
}