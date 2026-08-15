export const MESSAGE_SOURCE = 'chatgpt-exporter-extension' as const

export interface CaptureTestRequest {
    source: typeof MESSAGE_SOURCE
    type: 'CAPTURE_TEST_REQUEST'
    requestId: string
    payload: { message: string }
}

export interface CaptureTestResult {
    source: typeof MESSAGE_SOURCE
    type: 'CAPTURE_TEST_RESULT'
    requestId: string
    ok: boolean
    error?: string
}

export interface RuntimeCaptureTestRequest {
    type: 'CAPTURE_TEST'
    requestId: string
    payload: { message: string }
}

export interface RuntimeCaptureTestResponse {
    type: 'CAPTURE_TEST_ACK'
    requestId: string
    ok: boolean
}

export function isCaptureTestRequest(value: unknown): value is CaptureTestRequest {
    if (!isRecord(value)) return false
    return value.source === MESSAGE_SOURCE
        && value.type === 'CAPTURE_TEST_REQUEST'
        && typeof value.requestId === 'string'
        && isRecord(value.payload)
        && typeof value.payload.message === 'string'
}

export function isCaptureTestResult(value: unknown): value is CaptureTestResult {
    if (!isRecord(value)) return false
    return value.source === MESSAGE_SOURCE
        && value.type === 'CAPTURE_TEST_RESULT'
        && typeof value.requestId === 'string'
        && typeof value.ok === 'boolean'
}

export function isRuntimeCaptureTestResponse(value: unknown): value is RuntimeCaptureTestResponse {
    if (!isRecord(value)) return false
    return value.type === 'CAPTURE_TEST_ACK'
        && typeof value.requestId === 'string'
        && typeof value.ok === 'boolean'
}

export function createRequestId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}
