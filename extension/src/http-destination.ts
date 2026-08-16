import type { CaptureRecord } from '../../src/core/capture'

export interface CaptureEnvelope {
    schemaVersion: 1
    source: {
        kind: string
        conversationId: string
        url: string
    }
    raw: {
        text: string
        value: Record<string, unknown>
    }
}

export interface HttpSendResult {
    ok: true
    status: number
}

export function createCaptureEnvelope(record: CaptureRecord<Record<string, unknown>>): CaptureEnvelope {
    return {
        schemaVersion: 1,
        source: {
            kind: record.source.kind,
            conversationId: record.source.conversationId ?? '',
            url: record.source.url ?? '',
        },
        raw: {
            text: record.raw.text,
            value: record.raw.value,
        },
    }
}

export function validateEndpoint(endpoint: string): string {
    const url = new URL(endpoint.trim())
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        throw new Error('Der Endpoint muss mit http:// oder https:// beginnen.')
    }
    return url.toString()
}

export async function sendEnvelope(
    endpoint: string,
    envelope: CaptureEnvelope,
    fetchImpl: typeof fetch = fetch,
    timeoutMs = 10_000,
): Promise<HttpSendResult> {
    const url = validateEndpoint(endpoint)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const response = await fetchImpl(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(envelope),
            signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Endpoint antwortete mit HTTP ${response.status}.`)
        return { ok: true, status: response.status }
    }
    catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Der Endpoint hat nicht rechtzeitig geantwortet.')
        }
        throw error instanceof Error ? error : new Error('Der Versand an den Endpoint ist fehlgeschlagen.')
    }
    finally {
        clearTimeout(timeout)
    }
}

export async function testEndpoint(
    endpoint: string,
    fetchImpl: typeof fetch = fetch,
    timeoutMs = 5_000,
): Promise<HttpSendResult> {
    const url = validateEndpoint(endpoint)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const response = await fetchImpl(url, { method: 'GET', signal: controller.signal })
        if (!response.ok) throw new Error(`Endpoint antwortete mit HTTP ${response.status}.`)
        return { ok: true, status: response.status }
    }
    catch (error) {
        if (error instanceof Error && error.name === 'AbortError') throw new Error('Der Endpoint hat nicht rechtzeitig geantwortet.')
        throw error instanceof Error ? error : new Error('Der Endpoint-Test ist fehlgeschlagen.')
    }
    finally {
        clearTimeout(timeout)
    }
}
