import type { RuntimeCaptureTestRequest, RuntimeCaptureTestResponse } from './protocol'

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!isRuntimeCaptureTestRequest(message)) return false

    const response: RuntimeCaptureTestResponse = {
        type: 'CAPTURE_TEST_ACK',
        requestId: message.requestId,
        ok: message.payload.message.length > 0,
    }
    sendResponse(response)
    return false
})

function isRuntimeCaptureTestRequest(value: unknown): value is RuntimeCaptureTestRequest {
    if (typeof value !== 'object' || value === null) return false
    if (!('type' in value) || value.type !== 'CAPTURE_TEST') return false
    if (!('requestId' in value) || typeof value.requestId !== 'string') return false
    if (!('payload' in value) || typeof value.payload !== 'object' || value.payload === null) return false
    return 'message' in value.payload && typeof value.payload.message === 'string'
}
