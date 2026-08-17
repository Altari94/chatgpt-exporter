import type { CaptureRecord } from '../../src/core/capture'

export type DerivedFormat = 'text' | 'markdown' | 'html'

export interface DerivedExportResult {
    fileName: string
    mimeType: string
    content: string
}

export interface MarkdownMediaLink {
    pointer: string
    relativePath: string
    index: number
}

interface ConversationMessage {
    author?: { role?: string; name?: string }
    content?: { content_type?: string; parts?: unknown[]; text?: string }
    metadata?: Record<string, unknown>
}

interface ConversationNode {
    id?: string
    parent?: string | null
    message?: ConversationMessage | null
}

export function renderDerivedExport(record: CaptureRecord<Record<string, unknown>>, format: DerivedFormat): DerivedExportResult {
    const value = record.raw.value
    const title = typeof value.title === 'string' && value.title.trim() ? value.title : 'ChatGPT Conversation'
    const messages = orderedMessages(value)
    const blocks = messages.map(message => ({
        author: authorName(message.author),
        content: messageText(message),
    })).filter(block => block.content.trim())
    const safeTitle = sanitize(title)
    const id = record.source.conversationId ?? 'conversation'

    if (format === 'text') {
        return { fileName: `${safeTitle}--${id}.txt`, mimeType: 'text/plain;charset=utf-8', content: blocks.map(block => `${block.author}:\n${block.content}`).join('\n\n') }
    }
    if (format === 'html') {
        const body = blocks.map(block => `<article><h2>${escapeHtml(block.author)}</h2><div>${markdownishToHtml(block.content)}</div></article>`).join('\n')
        return { fileName: `${safeTitle}--${id}.html`, mimeType: 'text/html;charset=utf-8', content: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font:16px system-ui;max-width:860px;margin:40px auto;padding:0 20px;line-height:1.55}article{margin:0 0 28px}h1{font-size:28px}h2{font-size:14px;color:#5b6472;border-bottom:1px solid #e5e7eb;padding-bottom:6px}pre{background:#f3f4f6;padding:12px;overflow:auto;border-radius:8px}</style></head><body><h1>${escapeHtml(title)}</h1>${body}</body></html>` }
    }
    return { fileName: `${safeTitle}--${id}.md`, mimeType: 'text/markdown;charset=utf-8', content: renderMarkdownDocument(record, title, blocks, []) }
}

export function renderMarkdownDocument(
    record: CaptureRecord<Record<string, unknown>>,
    title: string,
    fallbackBlocks: Array<{ author: string; content: string }>,
    mediaLinks: MarkdownMediaLink[],
): string {
    const links = new Map(mediaLinks.map(link => [link.pointer, link.relativePath]))
    const blocks = orderedMessages(record.raw.value).map(message => ({
        author: authorName(message.author),
        content: messageText(message, links),
    })).filter(block => block.content.trim())
    const body = (blocks.length > 0 ? blocks : fallbackBlocks)
        .map(block => `#### ${block.author}\n\n${block.content}`).join('\n\n')
    const mediaSection = mediaLinks.length > 0
        ? `\n\n## Medien\n\n${mediaLinks.map(link => `- ![Bild ${link.index}](${link.relativePath})`).join('\n')}`
        : ''
    const source = record.source
    const created = typeof record.raw.value.create_time === 'number' ? new Date(record.raw.value.create_time * 1000).toISOString() : ''
    return `---\ntitle: ${yamlValue(title)}\nconversation_id: ${yamlValue(source.conversationId || '')}\ncreated: ${yamlValue(created)}\ncaptured_at: ${yamlValue(record.capturedAt)}\nsource_url: ${yamlValue(source.url || '')}\nraw_json: conversation.json\nmedia_manifest: media.json\n---\n\n# ${title}\n\n${body}${mediaSection}\n`
}

function orderedMessages(value: Record<string, unknown>): ConversationMessage[] {
    const mapping = value.mapping
    if (!mapping || typeof mapping !== 'object') return []
    const nodes = mapping as Record<string, ConversationNode>
    const current = typeof value.current_node === 'string' ? value.current_node : undefined
    const chain: ConversationNode[] = []
    const seen = new Set<string>()
    let cursor = current
    while (cursor && !seen.has(cursor)) {
        seen.add(cursor)
        const node = nodes[cursor]
        if (!node) break
        chain.unshift(node)
        cursor = typeof node.parent === 'string' ? node.parent : undefined
    }
    return chain.map(node => node.message).filter((message): message is ConversationMessage => Boolean(message))
}

function authorName(author?: ConversationMessage['author']): string {
    if (author?.role === 'assistant') return 'ChatGPT'
    if (author?.role === 'user') return 'You'
    if (author?.role === 'tool') return author.name ? `Plugin (${author.name})` : 'Plugin'
    return author?.role || 'Unknown'
}

function messageText(message: ConversationMessage, imageLinks = new Map<string, string>()): string {
    const content = message.content
    if (!content) return ''
    if (content.content_type === 'text' || content.content_type === 'code') return content.parts?.filter((part): part is string => typeof part === 'string').join('\n') || content.text || ''
    if (content.content_type === 'multimodal_text') {
        return content.parts?.map((part) => {
            if (typeof part === 'string') return part
            if (isRecord(part)) {
                const pointer = typeof part.asset_pointer === 'string' ? part.asset_pointer : typeof part.image_url === 'string' ? part.image_url : ''
                return imageLinks.has(pointer) ? `![Bild](${imageLinks.get(pointer)})` : '[Bild nicht verfügbar]'
            }
            return '[Bild]'
        }).join('\n') || ''
    }
    if (content.content_type === 'tether_quote') return `> ${content.text || ''}`
    return content.text || ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function yamlValue(value: string): string {
    return JSON.stringify(value)
}

function sanitize(value: string): string {
    return value.normalize('NFKC').replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 100) || 'ChatGPT Conversation'
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
        if (char === '&') return '&amp;'
        if (char === '<') return '&lt;'
        if (char === '>') return '&gt;'
        if (char === '"') return '&quot;'
        return '&#39;'
    })
}

function markdownishToHtml(value: string): string {
    return escapeHtml(value).replace(/```([\s\S]*?)```/g, '<pre>$1</pre>').replace(/\n/g, '<br>')
}
