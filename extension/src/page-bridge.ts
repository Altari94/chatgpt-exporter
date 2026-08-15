import {
    type CaptureTestRequest,
    MESSAGE_SOURCE,
} from './protocol'

window.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (event.source !== window || !isPageRequest(event.data)) return

    const request: CaptureTestRequest = {
        source: MESSAGE_SOURCE,
        type: 'CAPTURE_TEST_REQUEST',
        requestId: event.data.requestId,
        payload: event.data.payload,
    }
    window.postMessage(request, window.location.origin)
})

window.postMessage({
    source: MESSAGE_SOURCE,
    type: 'PAGE_BRIDGE_READY',
}, window.location.origin)

function isPageRequest(value: unknown): value is {
    type: 'CAPTURE_TEST_REQUEST'
    requestId: string
    payload: { message: string }
} {
    if (typeof value !== 'object' || value === null) return false
    if ('source' in value && value.source === MESSAGE_SOURCE) return false
    if (!('type' in value) || value.type !== 'CAPTURE_TEST_REQUEST') return false
    if (!('requestId' in value) || typeof value.requestId !== 'string') return false
    if (!('payload' in value) || typeof value.payload !== 'object' || value.payload === null) return false
    return 'message' in value.payload && typeof value.payload.message === 'string'
}
