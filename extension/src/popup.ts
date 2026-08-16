import { validateEndpoint } from './http-destination'
import { createRequestId } from './protocol'

const button = document.querySelector<HTMLButtonElement>('#ping')
const downloadButton = document.querySelector<HTMLButtonElement>('#download')
const endpointInput = document.querySelector<HTMLInputElement>('#endpoint')
const saveEndpointButton = document.querySelector<HTMLButtonElement>('#save-endpoint')
const sendEndpointButton = document.querySelector<HTMLButtonElement>('#send-endpoint')
const testEndpointButton = document.querySelector<HTMLButtonElement>('#test-endpoint')
const status = document.querySelector<HTMLParagraphElement>('#status')

chrome.storage.local.get(['httpEndpoint']).then((settings) => {
    if (endpointInput && typeof settings.httpEndpoint === 'string') endpointInput.value = settings.httpEndpoint
}).catch(() => undefined)

saveEndpointButton?.addEventListener('click', async () => {
    if (!endpointInput || !status) return
    let endpoint: string
    try {
        endpoint = validateEndpoint(endpointInput.value)
    }
    catch (error) {
        status.textContent = error instanceof Error ? error.message : 'Ungültiger Endpoint.'
        return
    }
    if (!await requestEndpointPermission(endpoint)) {
        status.textContent = 'Kein Zugriff auf die Endpoint-Domain erteilt.'
        return
    }
    await chrome.storage.local.set({ httpEndpoint: endpoint })
    status.textContent = 'Endpoint lokal gespeichert.'
})

sendEndpointButton?.addEventListener('click', async () => {
    if (!status) return
    status.textContent = 'Sende Capture …'
    if (endpointInput) {
        let endpoint: string
        try {
            endpoint = validateEndpoint(endpointInput.value)
        }
        catch (error) {
            status.textContent = error instanceof Error ? error.message : 'Ungültiger Endpoint.'
            return
        }
        if (!await requestEndpointPermission(endpoint)) {
            status.textContent = 'Kein Zugriff auf die Endpoint-Domain erteilt.'
            return
        }
    }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) return
    try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'SEND_CURRENT_TO_ENDPOINT' }) as { ok?: boolean; status?: number; errorMessage?: string } | undefined
        status.textContent = response?.ok ? `Gesendet (HTTP ${response.status}).` : (response?.errorMessage || 'Versand fehlgeschlagen.')
    }
    catch {
        status.textContent = 'Diese Seite ist keine unterstützte ChatGPT-Seite.'
    }
})

async function requestEndpointPermission(endpoint: string): Promise<boolean> {
    const url = new URL(endpoint)
    return chrome.permissions.request({ origins: [`${url.origin}/*`] })
}

testEndpointButton?.addEventListener('click', async () => {
    if (!status) return
    status.textContent = 'Teste HTTP-Endpoint …'
    try {
        if (endpointInput) {
            const endpoint = validateEndpoint(endpointInput.value)
            if (!await requestEndpointPermission(endpoint)) {
                status.textContent = 'Kein Zugriff auf die Endpoint-Domain erteilt.'
                return
            }
        }
        const response = await chrome.runtime.sendMessage({ type: 'TEST_HTTP_ENDPOINT' }) as { ok?: boolean; status?: number; errorMessage?: string } | undefined
        status.textContent = response?.ok ? `Endpoint erreichbar (HTTP ${response.status}).` : (response?.errorMessage || 'Endpoint-Test fehlgeschlagen.')
    }
    catch {
        status.textContent = 'Endpoint-Test fehlgeschlagen.'
    }
})

downloadButton?.addEventListener('click', async () => {
    if (!status) return
    status.textContent = 'Lade aktuellen Chat …'
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) {
        status.textContent = 'Kein aktiver Tab gefunden.'
        return
    }

    try {
        const response = await chrome.tabs.sendMessage(tab.id, {
            type: 'DOWNLOAD_CURRENT_CONVERSATION',
        }) as { ok?: boolean; fileName?: string; errorMessage?: string } | undefined
        status.textContent = response?.ok
            ? `Heruntergeladen: ${response.fileName}`
            : (response?.errorMessage || 'Download fehlgeschlagen.')
    }
    catch {
        status.textContent = 'Diese Seite ist keine unterstützte ChatGPT-Seite.'
    }
})

button?.addEventListener('click', async () => {
    if (!status) return
    status.textContent = 'Prüfe ChatGPT-Seite …'
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) {
        status.textContent = 'Kein aktiver Tab gefunden.'
        return
    }

    try {
        const response = await chrome.tabs.sendMessage(tab.id, {
            type: 'POPUP_PING',
            requestId: createRequestId(),
        }) as { ok?: boolean } | undefined
        status.textContent = response?.ok ? 'Extension-Shell ist verbunden.' : 'Keine Antwort erhalten.'
    }
    catch {
        status.textContent = 'Diese Seite ist keine unterstützte ChatGPT-Seite.'
    }
})
