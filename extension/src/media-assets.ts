export interface MediaReference {
    index: number
    pointer: string
    kind: 'image'
    jsonPath: string
}

export interface MediaAssetResult {
    index: number
    pointer: string
    kind: 'image'
    jsonPath: string
    fileName?: string
    mimeType?: string
    bytes?: number
    status: 'downloaded' | 'skipped' | 'failed'
    error?: string
}

/** Finds image pointers without mutating the original ChatGPT response. */
export function findMediaReferences(value: unknown): MediaReference[] {
    const references: MediaReference[] = []
    const seen = new Set<string>()
    walk(value, '$', references, seen)
    return references.map((reference, index) => ({ ...reference, index: index + 1 }))
}

function walk(value: unknown, jsonPath: string, references: MediaReference[], seen: Set<string>) {
    if (Array.isArray(value)) {
        value.forEach((item, index) => walk(item, `${jsonPath}[${index}]`, references, seen))
        return
    }
    if (!isRecord(value)) return

    if (value.content_type === 'image_asset_pointer' && typeof value.asset_pointer === 'string') {
        addReference(value.asset_pointer, jsonPath, references, seen)
    }
    if (typeof value.image_url === 'string') addReference(value.image_url, `${jsonPath}.image_url`, references, seen)
    if (typeof value.imageUrl === 'string') addReference(value.imageUrl, `${jsonPath}.imageUrl`, references, seen)
    Object.entries(value).forEach(([key, child]) => walk(child, `${jsonPath}.${key}`, references, seen))
}

function addReference(pointer: string, jsonPath: string, references: MediaReference[], seen: Set<string>) {
    if (!isSupportedImagePointer(pointer) || seen.has(pointer)) return
    seen.add(pointer)
    references.push({ index: 0, pointer, kind: 'image', jsonPath })
}

function isSupportedImagePointer(value: string): boolean {
    return value.startsWith('sediment://') || /^https?:\/\//i.test(value)
}

export function mediaFileName(index: number, pointer: string, mimeType = 'application/octet-stream'): string {
    const id = pointer.replace(/^sediment:\/\//, '').split(/[/?#]/)[0].replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48) || `image-${index}`
    return `asset-${String(index).padStart(3, '0')}-${id}${extensionForMimeType(mimeType)}`
}

function extensionForMimeType(mimeType: string): string {
    const normalized = mimeType.split(';', 1)[0].toLowerCase()
    switch (normalized) {
        case 'image/jpeg': return '.jpg'
        case 'image/png': return '.png'
        case 'image/webp': return '.webp'
        case 'image/gif': return '.gif'
        case 'image/svg+xml': return '.svg'
        default: return '.bin'
    }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}
