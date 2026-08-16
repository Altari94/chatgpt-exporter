export interface RawConversationResponse {
    conversationId: string
    url: string
    text: string
    value: Record<string, unknown>
}

export interface ConversationListItem {
    id: string
    title?: string
}

export class CaptureError extends Error {
    constructor(public readonly code: CaptureErrorCode, message: string) {
        super(message)
        this.name = 'CaptureError'
    }
}

export type CaptureErrorCode =
    | 'UNSUPPORTED_PAGE'
    | 'AUTHENTICATION_REQUIRED'
    | 'CONVERSATION_NOT_FOUND'
    | 'INVALID_RESPONSE'
    | 'NETWORK_ERROR'

export async function fetchCurrentConversation(
    pageUrl: string = window.location.href,
    fetchImpl: typeof fetch = fetch,
): Promise<RawConversationResponse> {
    const conversationId = getConversationId(pageUrl)
    const origin = new URL(pageUrl).origin
    const accessToken = await fetchAccessToken(origin, fetchImpl)
    const endpoint = `${origin}/backend-api/conversation/${encodeURIComponent(conversationId)}`

    let response: Response
    try {
        response = await fetchImpl(endpoint, {
            credentials: 'include',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-Authorization': `Bearer ${accessToken}`,
            },
        })
    }
    catch {
        throw new CaptureError('NETWORK_ERROR', 'Die ChatGPT-Unterhaltung konnte nicht abgerufen werden.')
    }

    if (response.status === 401 || response.status === 403) {
        throw new CaptureError('AUTHENTICATION_REQUIRED', 'Die ChatGPT-Sitzung ist abgelaufen oder nicht angemeldet.')
    }
    if (response.status === 404) {
        throw new CaptureError('CONVERSATION_NOT_FOUND', 'Die Unterhaltung wurde nicht gefunden.')
    }
    if (!response.ok) {
        throw new CaptureError('NETWORK_ERROR', `ChatGPT antwortete mit HTTP ${response.status}.`)
    }

    const text = await response.text()
    if (!text.trim()) throw new CaptureError('INVALID_RESPONSE', 'ChatGPT lieferte eine leere Antwort.')

    let value: Record<string, unknown>
    try {
        const parsed: unknown = JSON.parse(text)
        if (!isRecord(parsed)) throw new Error('Not an object')
        value = parsed
    }
    catch {
        throw new CaptureError('INVALID_RESPONSE', 'Die ChatGPT-Antwort ist kein gültiges JSON.')
    }

    return { conversationId, url: pageUrl, text, value }
}

/** Fetches the visible account conversations for the extension's Export All action. */
export async function fetchAllConversationSummaries(
    pageUrl: string = window.location.href,
    maxConversations = 1000,
    fetchImpl: typeof fetch = fetch,
): Promise<ConversationListItem[]> {
    const origin = new URL(pageUrl).origin
    const accessToken = await fetchAccessToken(origin, fetchImpl)
    const limit = 100
    const firstPage = await fetchConversationPage(origin, accessToken, 0, limit, fetchImpl)
    const firstItems = firstPage.items
    if (firstItems.length < limit || firstPage.total === 0) return firstItems.slice(0, maxConversations)

    if (typeof firstPage.total === 'number') {
        const pageCount = Math.min(Math.ceil(firstPage.total / limit), Math.ceil(maxConversations / limit))
        const offsets = Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => (index + 1) * limit)
        const pages = await mapWithConcurrency(offsets, 4, offset => fetchConversationPage(origin, accessToken, offset, limit, fetchImpl))
        return [firstItems, ...pages.map(page => page.items)].flat().slice(0, maxConversations)
    }

    const summaries = [...firstItems]
    for (let offset = limit; summaries.length < maxConversations; offset += limit) {
        const page = await fetchConversationPage(origin, accessToken, offset, limit, fetchImpl)
        summaries.push(...page.items)
        if (page.items.length < limit) break
    }
    return summaries.slice(0, maxConversations)
}

interface ConversationPage { items: ConversationListItem[]; total?: number }

async function fetchConversationPage(origin: string, accessToken: string, offset: number, limit: number, fetchImpl: typeof fetch): Promise<ConversationPage> {
    const response = await fetchImpl(`${origin}/backend-api/conversations?offset=${offset}&limit=${limit}`, {
        credentials: 'include',
        headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'X-Authorization': `Bearer ${accessToken}` },
    })
    if (!response.ok) throw new CaptureError('NETWORK_ERROR', `ChatGPT antwortete mit HTTP ${response.status}.`)
    const payload: unknown = await response.json()
    if (!isRecord(payload) || !Array.isArray(payload.items)) return { items: [] }
    return {
        items: payload.items.filter(isConversationListItem),
        total: typeof payload.total === 'number' ? payload.total : undefined,
    }
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = []
    let cursor = 0
    async function worker() {
        while (cursor < items.length) {
            const index = cursor++
            results[index] = await mapper(items[index])
        }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
    return results
}

export async function fetchConversationById(
    conversationId: string,
    pageUrl: string = window.location.href,
    fetchImpl: typeof fetch = fetch,
): Promise<RawConversationResponse> {
    const origin = new URL(pageUrl).origin
    const accessToken = await fetchAccessToken(origin, fetchImpl)
    const url = `${origin}/backend-api/conversation/${encodeURIComponent(conversationId)}`
    const response = await fetchImpl(url, {
        credentials: 'include',
        headers: { 'accept': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'X-Authorization': `Bearer ${accessToken}` },
    })
    if (!response.ok) throw new CaptureError(response.status === 404 ? 'CONVERSATION_NOT_FOUND' : 'NETWORK_ERROR', `ChatGPT antwortete mit HTTP ${response.status}.`)
    const text = await response.text()
    let value: Record<string, unknown>
    try {
        const parsed: unknown = JSON.parse(text)
        if (!isRecord(parsed)) throw new Error('Not an object')
        value = parsed
    }
    catch { throw new CaptureError('INVALID_RESPONSE', 'ChatGPT lieferte kein gültiges JSON.') }
    return { conversationId, url, text, value }
}

async function fetchAccessToken(origin: string, fetchImpl: typeof fetch): Promise<string> {
    let response: Response
    try {
        response = await fetchImpl(`${origin}/api/auth/session`, { credentials: 'include' })
    }
    catch {
        throw new CaptureError('NETWORK_ERROR', 'Die ChatGPT-Sitzung konnte nicht geprüft werden.')
    }
    if (!response.ok) {
        throw new CaptureError('AUTHENTICATION_REQUIRED', 'Die ChatGPT-Sitzung ist abgelaufen oder nicht angemeldet.')
    }

    const session: unknown = await response.json()
    if (!isRecord(session) || typeof session.accessToken !== 'string' || session.accessToken.length === 0) {
        throw new CaptureError('AUTHENTICATION_REQUIRED', 'Es wurde keine gültige ChatGPT-Sitzung gefunden.')
    }
    return session.accessToken
}

export function getConversationId(pageUrl: string): string {
    const match = new URL(pageUrl).pathname.match(/^\/c\/([^/]+)$/)
    if (!match?.[1]) throw new CaptureError('UNSUPPORTED_PAGE', 'Bitte öffne eine normale ChatGPT-Unterhaltung.')
    return match[1]
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function isConversationListItem(value: unknown): value is ConversationListItem {
    return isRecord(value) && typeof value.id === 'string' && (value.title === undefined || typeof value.title === 'string')
}
