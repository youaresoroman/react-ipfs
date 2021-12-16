import { IPFS } from "ipfs-core-types"
//import { API as RootAPI}  from "ipfs-core-types/src/root"
//import createIDAPI from "ipfs-core/src/components/id"
//import RootAPI from "ipfs-core/src/components/root"
//import { FileData } from "../classes/FileData"

//type addType = RootAPI["add"]

//type importCandidate = Parameters<addType>[0]
//type options = Parameters<addType>[1]
//type idres = ReturnType<typeof createIDAPI>
//type idresOptions = idres["options"]
//type idresResult = 
//type addReturn = ReturnType<addType>

export class Decorator {//implements RootAPI {
    node: IPFS | null;

    constructor(ipfs: IPFS | null) {
        this.node = ipfs
    }

    start = (): Promise<void> => {
        if (this.node) {
            return this.node.start()
                .then(() => {
                    console.log("%cIPFS Started", "color: green")
                })
                .catch((error: Error) => {
                    console.log(error.message)
                })
        } else {
            throw new Error("IPFS node is not ready")
        }
    }

    stop = (): Promise<void> => {
        if (this.node) {
            return this.node.stop()
                .then(() => {
                    console.log("Stopping IPFS")
                })
                .catch((error: Error) => {
                    console.log(error.message)
                })
        } else {
            throw new Error("IPFS node is not ready")
        }
    }



    // id = async (options) => {
    //     return new Promise((resolve) => {
    //         if (this.node) {
    //             return this.node.id(options)
    //         } else {
    //             resolve([false, new Error("IPFS node is not ready")])
    //         }
    //     })
    // }

    // cat = async (hash: string): Promise<[FileData | null, Error | unknown | null]> => {
    //     return new Promise((resolve) => {
    //         (async () => {
    //             if (this.node) {
    //                 try {
    //                     const chunks: Uint8Array[] = []
    //                     for await (const chunk of this.node.cat(hash)) {
    //                         chunks.push(chunk)
    //                     }
    //                     resolve([new FileData(chunks, hash), null])

    //                 } catch (error) {
    //                     resolve([null, error])
    //                 }
    //             } else {
    //                 resolve([null, new Error("IPFS node is not ready")])
    //             }
    //         })()
    //     })
    // }

    // add = async ({ entry, options }: { entry: importCandidate, options: options }): Promise<[boolean, Error | null]> => {
    //     return new Promise((resolve) => {
    //         if (this.node) {
    //             this.node.add(entry, options)
    //                 .then(() => resolve([true, null]))
    //                 .catch((error: Error) => resolve([false, error]))
    //         } else {
    //             resolve([false, new Error("IPFS node is not ready")])
    //         }
    //     })
    // }
}