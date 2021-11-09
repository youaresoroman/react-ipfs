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