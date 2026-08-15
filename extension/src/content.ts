import {
    type CaptureTestResult,
    MESSAGE_SOURCE,
    type RuntimeCaptureTestRequest,
    isCaptureTestRequest,
    isRuntimeCaptureTestResponse,
} from './protocol'
import { captureCurrentConversation, formatCaptureError } from './raw-download'

injectPageBridge()

window.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (event.source !== window || !isCaptureTestRequest(event.data)) return

    const request = event.data
    const runtimeMessage: RuntimeCaptureTestRequest = {
        type: 'CAPTURE_TEST',
        requestId: request.requestId,
        payload: request.payload,
    }

    chrome.runtime.sendMessage(runtimeMessage).then((rawResponse: unknown) => {
        const response = isRuntimeCaptureTestResponse(rawResponse) ? rawResponse : null
        const result: CaptureTestResult = {
            source: MESSAGE_SOURCE,
            type: 'CAPTURE_TEST_RESULT',
            requestId: request.requestId,
            ok: response?.ok === true,
            ...(response?.ok === true ? {} : { error: 'Service worker did not acknowledge the request.' }),
        }
        window.postMessage(result, window.location.origin)
    }).catch(() => {
        window.postMessage({
            source: MESSAGE_SOURCE,
            type: 'CAPTURE_TEST_RESULT',
            requestId: request.requestId,
            ok: false,
            error: 'Service worker is unavailable.',
        } satisfies CaptureTestResult, window.location.origin)
    })
})

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (isDownloadRequest(message)) {
        captureCurrentConversation().then(result => sendResponse(result)).catch((error: unknown) => sendResponse({
            ok: false,
            errorMessage: formatCaptureError(error),
            errorCode: error instanceof Error && 'code' in error ? String(error.code) : 'UNKNOWN',
        }))
        return true
    }
    if (!isPopupPing(message)) return false
    sendResponse({ ok: true })
    return false
})

function injectPageBridge() {
    const script = document.createElement('script')
    script.src = chrome.runtime.getURL('page-bridge.js')
    script.onload = () => script.remove()
    ;(document.head || document.documentElement).append(script)
}

function isPopupPing(value: unknown): value is { type: 'POPUP_PING' } {
    return typeof value === 'object' && value !== null && 'type' in value && value.type === 'POPUP_PING'
}

function isDownloadRequest(value: unknown): value is { type: 'DOWNLOAD_CURRENT_CONVERSATION' } {
    return typeof value === 'object' && value !== null && 'type' in value && value.type === 'DOWNLOAD_CURRENT_CONVERSATION'
}
