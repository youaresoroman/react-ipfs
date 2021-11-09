export function getExtension(url: string) {
    return url.slice((url.lastIndexOf(".") - 1 >>> 0) + 2)
}