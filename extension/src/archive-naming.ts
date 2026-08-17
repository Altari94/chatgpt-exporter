export interface ArchiveName {
    folder: string
    fileName: string
}

/** Human-readable, stable and collision-resistant default for exported chats. */
export function buildArchiveName(title: string | undefined, conversationId: string, createdAt?: unknown): ArchiveName {
    const date = formatCreatedDate(createdAt)
    const titleSlug = slugifyTitle(title)
    const shortId = conversationId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'conversation'
    const base = `${date}__${titleSlug}__${shortId}`
    return { folder: `ChatGPT Exporter/${base}`, fileName: `${base}.json` }
}

export function formatCreatedDate(value: unknown): string {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 'unknown-date'
    const date = new Date(value * 1000)
    return Number.isNaN(date.getTime()) ? 'unknown-date' : date.toISOString().slice(0, 10)
}

export function slugifyTitle(title: string | undefined): string {
    const normalized = (title || 'ChatGPT Conversation').normalize('NFKC')
    const slug = normalized
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80)
    return slug || 'chatgpt-conversation'
}
