import Ipfs from "ipfs"
import IPFS from "ipfs-core/src/components"
import { useEffect, useState } from "react";
import { useStore } from "react-context-hook";
import { ipfsInstance } from "../index.types";
import { ipfsInstanceDecorator } from "../index.types"
import { IPFSDecorator } from "../classes"
import { MFSEntry } from "ipfs-core-types/src/files";
import { IPFSFileData } from "../classes";
import { concat } from "uint8arrays";

let ipfs: IPFS | null = null

export const startIPFSInstance = (verbose: "silent" | "info" | "full" = "info") => {
    const [isIpfsReady, setIpfsReady] = useState(Boolean(ipfs))
    const [,setInstance] = useStore('ipfsInstance', {
        ipfs: undefined,
        isIpfsReady: false
    }) as ipfsInstance;

    useEffect(() => {
        startIpfs()
        return function cleanup() {
            if (ipfs && ipfs.stop) {
                verbose == "info" || verbose == "full" ? console.log("Stopping IPFS") : null
                ipfs.stop().catch((error: Error) => verbose == "full" ? console.log(`%c${error}`,"color:red") : null)
                ipfs = null
                setIpfsReady(false)
            }
        }
    }, [])

    useEffect(() => {
        if (ipfs) {
            setInstance({
                ipfs,
                isIpfsReady
            })
        }
    }, [isIpfsReady])

    const startIpfs = async () => {
        if (!ipfs) {
            try {
                verbose == "info" || verbose == "full" ? console.log("%cIPFS Started", "color: green"): null
                ipfs = await Ipfs.create()
            } catch (error) {
                ipfs = null
                verbose == "full" ? console.log(`%c${error}`,"color:red") : null
            }
        }

        setIpfsReady(Boolean(ipfs))
    }

    return
}

export function useIPFS() {
    const [ipfs, setIPFS] = useState<IPFSDecorator>()
    const [isIpfsReady, setIpfsReady] = useState(false)
    const [instance] = useStore('ipfsInstance', {
        ipfs: undefined,
        isIpfsReady: false
    }) as ipfsInstanceDecorator;

    useEffect(() => {
        if (instance.isIpfsReady && instance.ipfs) {
            setIPFS(new IPFSDecorator(instance.ipfs))
            setIpfsReady(instance.isIpfsReady)
        }
    }, [instance])

    return { ipfs, isIpfsReady }
}


export const useIPFSFolderState = (path: string): [
    string,
    {
        ls: (path?: string) => Promise<[MFSEntry[] | null, Error | null | unknown]>,
        getHash: (path: string) => Promise<[string | null, Error | null]>,
        read: (path: string) => Promise<[IPFSFileData | null, Error | null]>,
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


    const read = async (pathToRead: string): Promise<[IPFSFileData | null, Error | null]> => {
        return new Promise((resolve) => {
            const actualPath = `${path}${pathToRead}`
            if (isIpfsReady && ipfs) {
                ipfs.files.stat(actualPath)
                    .then(async () => {
                        const chunks: Uint8Array[] = []
                        for await (const chunk of ipfs.files.read(actualPath)) {
                            chunks.push(chunk)
                        }
                        resolve([new IPFSFileData(concat(chunks)), null])
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

    const ls = async (pathToList?: string): Promise<[MFSEntry[] | null, Error | null | unknown]> => {
        return new Promise((resolve) => {
            if (isIpfsReady && ipfs) {
                (async ()=>{
                    try {
                        const actualPath = `${path}${pathToList ? pathToList : ""}`
                        const list: MFSEntry[] = []
                        for await (const file of ipfs.files.ls(actualPath)) {
                            list.push(file)
                        }
                        resolve([list, null])
                    } catch(error) {
                        resolve([null, error]);
                    }
                })()
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