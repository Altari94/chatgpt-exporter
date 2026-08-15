import { createRequestId } from './protocol'

const button = document.querySelector<HTMLButtonElement>('#ping')
const status = document.querySelector<HTMLParagraphElement>('#status')

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
