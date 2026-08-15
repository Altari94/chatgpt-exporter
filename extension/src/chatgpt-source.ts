export interface RawConversationResponse {
    conversationId: string
    url: string
    text: string
    value: Record<string, unknown>
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
