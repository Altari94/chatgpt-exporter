import { type CaptureEnvelope, sendEnvelope, testEndpoint } from './http-destination'
import type { RuntimeCaptureTestRequest, RuntimeCaptureTestResponse } from './protocol'

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (isDownloadFileRequest(message)) {
        chrome.downloads.download({ url: message.dataUrl, filename: message.filename, saveAs: false, conflictAction: 'overwrite' })
            .then(downloadId => sendResponse({ ok: true, downloadId }))
            .catch((error: unknown) => sendResponse({ ok: false, errorMessage: error instanceof Error ? error.message : 'Datei konnte nicht gespeichert werden.' }))
        return true
    }
    if (isSendCaptureRequest(message)) {
        sendConfiguredEnvelope(message.envelope)
            .then(sendResponse)
            .catch((error: unknown) => sendResponse({ ok: false, errorMessage: error instanceof Error ? error.message : 'Versand fehlgeschlagen.' }))
        return true
    }
    if (isEndpointTestRequest(message)) {
        testConfiguredEndpoint()
            .then(sendResponse)
            .catch((error: unknown) => sendResponse({ ok: false, errorMessage: error instanceof Error ? error.message : 'Endpoint-Test fehlgeschlagen.' }))
        return true
    }
    if (!isRuntimeCaptureTestRequest(message)) return false

    const response: RuntimeCaptureTestResponse = {
        type: 'CAPTURE_TEST_ACK',
        requestId: message.requestId,
        ok: message.payload.message.length > 0,
    }
    sendResponse(response)
    return false
})

async function sendConfiguredEnvelope(envelope: CaptureEnvelope) {
    const settings = await chrome.storage.local.get(['httpEndpoint'])
    const endpoint = typeof settings.httpEndpoint === 'string' ? settings.httpEndpoint : ''
    if (!endpoint) throw new Error('Bitte zuerst einen HTTP-Endpoint konfigurieren.')
    return sendEnvelope(endpoint, envelope)
}

function isDownloadFileRequest(value: unknown): value is { type: 'DOWNLOAD_FILE'; filename: string; dataUrl: string } {
    return typeof value === 'object' && value !== null
        && 'type' in value && value.type === 'DOWNLOAD_FILE'
        && 'filename' in value && typeof value.filename === 'string'
        && 'dataUrl' in value && typeof value.dataUrl === 'string'
        && value.dataUrl.startsWith('data:')
}

async function testConfiguredEndpoint() {
    const settings = await chrome.storage.local.get(['httpEndpoint'])
    const endpoint = typeof settings.httpEndpoint === 'string' ? settings.httpEndpoint : ''
    if (!endpoint) throw new Error('Bitte zuerst einen HTTP-Endpoint konfigurieren.')
    return testEndpoint(endpoint)
}

function isSendCaptureRequest(value: unknown): value is { type: 'SEND_CAPTURE_TO_ENDPOINT'; envelope: CaptureEnvelope } {
    return typeof value === 'object' && value !== null
        && 'type' in value && value.type === 'SEND_CAPTURE_TO_ENDPOINT'
        && 'envelope' in value && typeof value.envelope === 'object' && value.envelope !== null
}

function isEndpointTestRequest(value: unknown): value is { type: 'TEST_HTTP_ENDPOINT' } {
    return typeof value === 'object' && value !== null && 'type' in value && value.type === 'TEST_HTTP_ENDPOINT'
}

function isRuntimeCaptureTestRequest(value: unknown): value is RuntimeCaptureTestRequest {
    if (typeof value !== 'object' || value === null) return false
    if (!('type' in value) || value.type !== 'CAPTURE_TEST') return false
    if (!('requestId' in value) || typeof value.requestId !== 'string') return false
    if (!('payload' in value) || typeof value.payload !== 'object' || value.payload === null) return false
    return 'message' in value.payload && typeof value.payload.message === 'string'
}
