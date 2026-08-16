import { fetchAllConversationSummaries } from './chatgpt-source'
import { type DerivedFormat, renderDerivedExport } from './derived-export'
import { createCaptureEnvelope } from './http-destination'
import {
    type CaptureTestResult,
    MESSAGE_SOURCE,
    type RuntimeCaptureTestRequest,
    isCaptureTestRequest,
    isRuntimeCaptureTestResponse,
} from './protocol'
import {
    captureConversationById,
    captureCurrentConversation,
    captureCurrentConversationRecord,
    formatCaptureError,
} from './raw-download'

injectPageBridge()
let exportCancelled = false

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
    if (isExportAllRequest(message)) {
        fetchAllConversationSummaries()
            .then(summaries => sendResponse({ ok: true, items: summaries }))
            .catch((error: unknown) => sendResponse({ ok: false, errorMessage: formatCaptureError(error) }))
        return true
    }
    if (isSelectedExportRequest(message)) {
        exportCancelled = false
        exportSelected(message.ids)
            .then(result => sendResponse(result))
            .catch((error: unknown) => sendResponse({ ok: false, errorMessage: formatCaptureError(error) }))
        return true
    }
    if (isCancelExportRequest(message)) {
        exportCancelled = true
        sendResponse({ ok: true })
        return false
    }
    if (isDerivedExportRequest(message)) {
        captureCurrentConversationRecord()
            .then((record) => {
                if (message.format === 'clipboard') {
                    const rendered = renderDerivedExport(record, 'text')
                    return copyText(rendered.content).then(() => ({ ok: true, format: message.format }))
                }
                const rendered = renderDerivedExport(record, message.format)
                downloadDerivedText(rendered.fileName, rendered.mimeType, rendered.content)
                return { ok: true, fileName: rendered.fileName, format: message.format }
            })
            .then(response => sendResponse(response))
            .catch((error: unknown) => sendResponse({ ok: false, errorMessage: formatCaptureError(error) }))
        return true
    }
    if (isEndpointRequest(message)) {
        captureCurrentConversationRecord()
            .then(record => chrome.runtime.sendMessage({
                type: 'SEND_CAPTURE_TO_ENDPOINT',
                envelope: createCaptureEnvelope(record),
            }))
            .then(response => sendResponse(response))
            .catch((error: unknown) => sendResponse({
                ok: false,
                errorMessage: formatCaptureError(error),
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

function isDerivedExportRequest(value: unknown): value is { type: 'EXPORT_CURRENT'; format: DerivedFormat | 'clipboard' } {
    if (typeof value !== 'object' || value === null || !('type' in value) || value.type !== 'EXPORT_CURRENT' || !('format' in value)) return false
    return value.format === 'text' || value.format === 'markdown' || value.format === 'html' || value.format === 'clipboard'
}

function isExportAllRequest(value: unknown): value is { type: 'LIST_CONVERSATIONS' } {
    return typeof value === 'object' && value !== null && 'type' in value && value.type === 'LIST_CONVERSATIONS'
}

function isSelectedExportRequest(value: unknown): value is { type: 'EXPORT_SELECTED_RAW'; ids: string[] } {
    return typeof value === 'object' && value !== null && 'type' in value && value.type === 'EXPORT_SELECTED_RAW'
        && 'ids' in value && Array.isArray(value.ids) && value.ids.every(id => typeof id === 'string')
}

function isCancelExportRequest(value: unknown): value is { type: 'CANCEL_EXPORT' } {
    return typeof value === 'object' && value !== null && 'type' in value && value.type === 'CANCEL_EXPORT'
}

async function exportSelected(ids: string[]) {
    let count = 0
    for (const id of ids) {
        if (exportCancelled) return { ok: true, count, cancelled: true }
        await captureConversationById(id)
        count += 1
        await new Promise(resolve => window.setTimeout(resolve, 80))
    }
    return { ok: true, count, cancelled: false }
}

function downloadDerivedText(fileName: string, mimeType: string, content: string) {
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function copyText(content: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content)
        return
    }
    const textarea = document.createElement('textarea')
    textarea.value = content
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.append(textarea)
    textarea.select()
    if (!document.execCommand('copy')) throw new Error('Der Text konnte nicht in die Zwischenablage kopiert werden.')
    textarea.remove()
}

function isEndpointRequest(value: unknown): value is { type: 'SEND_CURRENT_TO_ENDPOINT' } {
    return typeof value === 'object' && value !== null && 'type' in value && value.type === 'SEND_CURRENT_TO_ENDPOINT'
}
