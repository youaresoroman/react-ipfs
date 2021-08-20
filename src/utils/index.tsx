
import { useEffect } from "react";
import { useState } from "react";
import uint8ArrayConcat from "uint8arrays/concat";
import { useIPFS } from "..";

export const readFileFromIPFS = async (ipfs: any, cid: string): Promise<[ipfsFileData | null, Error | null]> => {

    return new Promise((resolve) => {
        try {
            (async () => {
                try {
                    for await (const file of ipfs.get(cid)) {
                        if (file.type == "file") {
                            if (!file.content) continue;

                            const content = []

                            for await (const chunk of file.content) {
                                content.push(chunk)
                            }
                            resolve([new ipfsFileData(uint8ArrayConcat(content)), null])
                        } else {
                            resolve([null, new Error(`${cid} is not a file`)])
                        }
                    }
                } catch (error) {
                    resolve([null, error])
                }
            })()
        } catch (error) {
            resolve([null, error])
        }

    })
}

export const listDirectoryIPFS = async (ipfs: any, path: string): Promise<[IpfsFile[] | null, Error | null]> => {

    return new Promise((resolve) => {

        try {
            (async () => {
                try {
                    const list: IpfsFile[] = []
                    for await (const file of ipfs.ls(path)) {
                        const { name, type, size, cid } = file
                        list.push({
                            name,
                            type,
                            size,
                            hash: cid.string
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

export function useIPFSMFSJSONfile<S>(path: string, initialState: S): [
    boolean,
    S,
    (newState: S) => Promise<boolean>
] {

    const [fileReady, setFileReady] = useState<boolean>(false);
    const [fileData, setFileData] = useState<S>(initialState);
    const { ipfs, isIpfsReady } = useIPFS();

    const readData = async (): Promise<boolean> => {
        return new Promise((resolve) => {
            ipfs.files.stat(path)
                .then(async (data: any) => {
                    if (data.type == "file") {
                        try {
                            const chunks: Uint8Array[] = []
                            for await (const chunk of ipfs.files.read(path)) {
                                chunks.push(chunk)
                            }

                            const fileData = new ipfsFileData(uint8ArrayConcat(chunks))
                            setFileData(fileData.toJSON() as S)
                            resolve(true)

                        } catch (error) {
                            console.log(error);

                            await ipfs.files.rm(path)
                                .then(() => {
                                    ipfs.files.stat(path)
                                        .then(async () => {
                                            resolve(false)
                                        })
                                        .catch(async () => {
                                            const res = await updateData(initialState)
                                            if (res) {
                                                resolve(true)
                                            } else {
                                                resolve(false)
                                            }
                                        })
                                })
                                .catch((error: Error) => {
                                    console.log(error);
                                    resolve(false);
                                })
                        }
                    }
                })
                .catch(async (error: Error) => {
                    console.log(error);
                    const res = await updateData(initialState)
                    if (res) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                })
        })
    }

    const updateData = async (newData: S): Promise<boolean> => {
        return new Promise((resolve) => {
            try {
                const dataToWrite = new TextEncoder().encode(JSON.stringify(newData))

                ipfs.files.write(path, dataToWrite, {
                    parents: true,
                    create: true
                })
                    .then(() => {
                        ipfs.files.stat(path)
                            .then(async () => {
                                setFileData(newData)
                                resolve(true);
                            })
                            .catch((error: Error) => {
                                console.log(error);
                                resolve(false);
                            })
                    })
                    .catch((error: Error) => {
                        console.log(error);
                        resolve(false);
                    })
            } catch (error) {
                console.log(error);
                resolve(false);
            }

        })
    }

    useEffect(() => {
        if (ipfs && isIpfsReady) {
            (async () => {
                setFileReady(await readData())
            })()
        }
        return
    }, [ipfs, isIpfsReady])

    return [
        fileReady,
        fileData,
        updateData
    ]
}

export const useIpfsFolderState = (path: string): {
    folderHash: string,
    ls: (path?: string) => Promise<[IpfsFile[] | null, Error | null]>,
    getHash: (path: string) => Promise<[string | null, Error | null]>,
    read: (path: string) => Promise<[ipfsFileData | null, Error | null]>,
    write: (fileName: string, content: Uint8Array | ArrayBuffer | string | Blob) => Promise<[string | null, Error | null]>,
    writeAll: (list: { fileName: string, content: Uint8Array | ArrayBuffer | string | Blob }[]) => Promise<[boolean, Error | null]>,
    rm: (path?: string) => Promise<[boolean | null, Error | null]>,
    readJSON: <S>(file: string, startData: S) => Promise<S>
    writeJSON: <S>(file: string, newData: S) => Promise<boolean>
} => {

    const [folderHash, setFolderHash] = useState<string>("");
    const { ipfs, isIpfsReady } = useIPFS();

    useEffect(() => {
        if (ipfs && isIpfsReady) {
            //setIpfs(ipfs)

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
    }, [ipfs, isIpfsReady])


    const read = async (pathToRead: string): Promise<[ipfsFileData | null, Error | null]> => {
        return new Promise((resolve) => {
            const actualPath = `${path}${pathToRead}`
            ipfs.files.stat(actualPath)
                .then(async () => {
                    const chunks: Uint8Array[] = []
                    for await (const chunk of ipfs.files.read(actualPath)) {
                        chunks.push(chunk)
                    }
                    resolve([new ipfsFileData(uint8ArrayConcat(chunks)), null])
                })
                .catch((error: Error) => {
                    resolve([null, error]);
                })
        })
    }

    const getHash = async (pathToRead: string): Promise<[string | null, Error | null]> => {
        return new Promise((resolve) => {
            const actualPath = `${path}${pathToRead}`
            ipfs.files.stat(actualPath)
                .then(async (data: any) => {
                    resolve([data?.cid.string, null])
                })
                .catch((error: Error) => {
                    resolve([null, error]);
                })
        })
    }

    const ls = async (pathToList?: string): Promise<[IpfsFile[] | null, Error | null]> => {
        return new Promise((resolve) => {
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
                            hash: cid.string
                        })
                    }
                    resolve([list, null])
                })
                .catch((error: Error) => {
                    resolve([null, error]);
                })
        })
    }

    const write = (fileName: string, content: Uint8Array | ArrayBuffer | string | Blob): Promise<[string | null, Error | null]> => {
        return new Promise((resolve) => {
            const file = `${path}${fileName}`
            rm(file)
                .then(([res, err]) => {
                    if (res) {
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
                    } else {
                        resolve([null, err]);
                    }
                })
        })

    }

    const writeAll = async (list: { fileName: string, content: Uint8Array | ArrayBuffer | string | Blob }[]): Promise<[boolean, Error | null]> => {
        return new Promise((resolve) => {
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
        })
    }

    const rm = (pathToRemove?: string): Promise<[boolean | null, Error | null]> => {
        return new Promise((resolve) => {
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
        })
    }

    async function readJSON<S>(file: string, startData: S) {
        try {
            const [boxData] = await read(file)
            if (boxData !== null) {
                return boxData.toJSON()
            }
            return startData
        } catch (error) {
            return startData
        }

    }

    async function writeJSON<S>(file: string, newData: S) {
        const data = await readJSON(file, newData)
        const [res] = await write(file, JSON.stringify({ ...data, ...newData }))
        return res ? true : false
    }

    return {
        folderHash,
        getHash,
        ls,
        read,
        write,
        writeAll,
        rm,
        readJSON,
        writeJSON
    }
}