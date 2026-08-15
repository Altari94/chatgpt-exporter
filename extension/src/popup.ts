import { createRequestId } from './protocol'

const button = document.querySelector<HTMLButtonElement>('#ping')
const downloadButton = document.querySelector<HTMLButtonElement>('#download')
const status = document.querySelector<HTMLParagraphElement>('#status')

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
