import { getExtension, getMime } from "../functions";
import { concat } from "uint8arrays";

export class FileData {
    content: Uint8Array;
    fileName: string;

    constructor(content: Uint8Array[], fileName: string) {
        this.content = concat(content)
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
