import { useEffect, useState } from "react";
import { MFSEntry, StatResult } from "ipfs-core-types/src/files";
import { IPFSFileData } from "../classes/FileData";
import { concat } from "uint8arrays";
import { useIPFS } from "./useIPFS";

export const useIPFSFolderState = (path: string): [
    string,
    {
        ls: (path?: string) => Promise<[MFSEntry[] | null, Error | null | unknown]>,
        getHash: (path: string) => Promise<[string | null, Error | null]>,
        read: (path: string) => Promise<[IPFSFileData | null, Error | null]>,
        write: (fileName: string, content: string | Uint8Array | Blob | AsyncIterable<Uint8Array> | Iterable<Uint8Array>) => Promise<[string | null, Error | null]>,
        writeAll: (list: { fileName: string, content: string | Uint8Array | Blob | AsyncIterable<Uint8Array> | Iterable<Uint8Array> }[]) => Promise<[boolean, Error | null]>,
        rm: (path?: string) => Promise<[boolean | null, Error | null]>,
        mkdir: (pathToMake: string) => Promise<[boolean | null, Error | null]>,
        mv: (originalPath: string, pathToMove: string) => Promise<[boolean, Error | null]>
    }
] => {

    const [folderHash, setFolderHash] = useState<string>("");
    const ipfs = useIPFS();

    useEffect(() => {

        if (ipfs) {
            ipfs.files.stat(path)
                .then(async (data: StatResult) => {
                    if (data) {
                        if (data.type != "directory") {
                            throw new Error("Path is a file")
                        } else {
                            setFolderHash(data.cid.toString())
                        }
                    } else {
                        throw new Error("Get folder hash error")
                    }
                })
                .catch(() => {
                    if (ipfs) {
                        ipfs.files.mkdir(path, {
                            parents: true
                        })
                            .then(() => {
                                if (ipfs) {
                                    ipfs.files.stat(path)
                                        .then(async (data: StatResult) => {
                                            if (data) {
                                                if (data.type != "directory") {
                                                    throw new Error("Path is a file")
                                                } else {
                                                    setFolderHash(data.cid.toString())
                                                }
                                            } else {
                                                throw new Error("Get folder hash error")
                                            }
                                        })
                                        .catch((error: Error) => {
                                            console.error(error);
                                        })
                                } else {
                                    console.error("Ipfs instance not started yet");
                                }
                            })
                            .catch((error: Error) => {
                                console.error(error);
                            })
                    } else {
                        console.error("Ipfs instance not started yet");
                    }
                })
        }
        return
    }, [ipfs])


    const read = async (pathToRead: string): Promise<[IPFSFileData | null, Error | null]> => {
        return new Promise((resolve) => {
            const actualPath = `${path}${pathToRead}`
            if (ipfs) {
                ipfs.files.stat(actualPath)
                    .then(async () => {
                        if (ipfs) {
                            const chunks: Uint8Array[] = []
                            for await (const chunk of ipfs.files.read(actualPath)) {
                                chunks.push(chunk)
                            }
                            resolve([new IPFSFileData(concat(chunks), actualPath), null])
                        } else {
                            resolve([null, new Error("Ipfs instance not started yet")]);
                        }
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
            if (ipfs) {
                const actualPath = `${path}${pathToRead}`
                ipfs.files.stat(actualPath)
                    .then(async (data: StatResult) => {
                        if (data) {
                            resolve([data.cid.toString(), null])
                        } else {
                            resolve([null, new Error("Get hash error")])
                        }
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
            if (ipfs) {
                const actualOriginalPath = `${path}${originalPath}`
                const actualPathToMove = `${path}${pathToMove}`

                ipfs.files.mv(actualOriginalPath, actualPathToMove, { parents: true })
                    .then(() => {
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

    const mkdir = async (pathToMake: string): Promise<[boolean | null, Error | null]> => {
        return new Promise((resolve) => {
            if (ipfs) {
                const actualPath = `${path}${pathToMake}`
                ipfs.files.mkdir(actualPath, { parents: true })
                    .then(() => {
                        resolve([true, null]);
                    })
                    .catch((error: Error) => {
                        resolve([false, error]);
                    })
            } else {
                resolve([null, new Error("Ipfs instance not started yet")]);
            }
        })
    }

    const ls = async (pathToList?: string): Promise<[MFSEntry[] | null, Error | null | unknown]> => {
        return new Promise((resolve) => {
            if (ipfs) {
                (async () => {
                    if (ipfs) {
                        try {
                            const actualPath = `${path}${pathToList ? pathToList : ""}`
                            const list: MFSEntry[] = []
                            for await (const file of ipfs.files.ls(actualPath)) {
                                list.push(file)
                            }
                            resolve([list, null])
                        } catch (error) {
                            resolve([null, error]);
                        }
                    } else {
                        resolve([null, new Error("Ipfs instance not started yet")]);
                    }
                })()
            } else {
                resolve([null, new Error("Ipfs instance not started yet")]);
            }
        })
    }

    const write = (fileName: string, content: string | Uint8Array | Blob | AsyncIterable<Uint8Array> | Iterable<Uint8Array>): Promise<[string | null, Error | null]> => {
        return new Promise((resolve) => {
            if (ipfs) {
                const file = `${path}${fileName}`
                ipfs.files.stat(path)
                    .then(async () => {
                        rm(file)
                            .then(() => {
                                if (ipfs) {
                                    ipfs.files.write(file, content, {
                                        parents: true,
                                        create: true
                                    })
                                        .then(() => {
                                            if (ipfs) {
                                                ipfs.files.stat(path)
                                                    .then(async (data: StatResult) => {
                                                        if (data) {
                                                            setFolderHash(data.cid.toString())
                                                            if (ipfs) {
                                                                ipfs.files.stat(file)
                                                                    .then(async (data: StatResult) => {
                                                                        if (data) {
                                                                            resolve([data.cid.toString(), null])
                                                                        } else {
                                                                            resolve([null, new Error("Get folder hash error")])
                                                                        }
                                                                    })
                                                                    .catch((error: Error) => {
                                                                        resolve([null, error]);
                                                                    })
                                                            } else {
                                                                resolve([null, new Error("Get folder hash error")])
                                                            }
                                                            setFolderHash(data?.cid.toString())
                                                        } else {
                                                            resolve([null, new Error("Ipfs instance not started yet")]);
                                                        }
                                                    })
                                                    .catch((error: Error) => {
                                                        resolve([null, error]);
                                                    })
                                            } else {
                                                resolve([null, new Error("Ipfs instance not started yet")]);
                                            }
                                        })
                                        .catch((error: Error) => {
                                            resolve([null, error]);
                                        })
                                } else {
                                    resolve([null, new Error("Ipfs instance not started yet")]);
                                }
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
            if (ipfs) {
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
            if (ipfs) {
                if (pathToRemove) {
                    ipfs.files.rm(`${path}/${pathToRemove}`, { recursive: true })
                        .then(() => {
                            if (ipfs) {
                                ipfs.files.stat(path)
                                    /* eslint-disable @typescript-eslint/no-explicit-any */
                                    .then(async (data: StatResult) => {
                                        if (data) {
                                            setFolderHash(data.cid.toString())
                                            resolve([true, null])
                                        } else {
                                            resolve([null, new Error("Get folder hash error")])
                                        }
                                    })
                                    .catch((error: Error) => {
                                        resolve([null, error]);
                                    })
                            } else {
                                resolve([false, new Error("Ipfs instance not started yet")]);
                            }
                        })
                        .catch((error: Error) => {
                            resolve([null, error]);
                        })
                } else {
                    ipfs.files.rm(path, { recursive: true })
                        .then(() => {
                            if (ipfs) {
                                ipfs.files.stat(path)
                                    .then(() => {
                                        resolve([null, new Error("Remove Failed")]);
                                    })
                                    .catch(() => {
                                        setFolderHash("")
                                        resolve([true, null])

                                    })
                            } else {
                                resolve([false, new Error("Ipfs instance not started yet")]);
                            }
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
            mkdir,
            mv
        }
    ]
}