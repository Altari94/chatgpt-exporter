import { validateEndpoint } from './http-destination'
import { createRequestId } from './protocol'

const button = document.querySelector<HTMLButtonElement>('#ping')
const downloadButton = document.querySelector<HTMLButtonElement>('#download')
const loadChatsButton = document.querySelector<HTMLButtonElement>('#load-chats')
const selectAllButton = document.querySelector<HTMLButtonElement>('#select-all')
const clearAllButton = document.querySelector<HTMLButtonElement>('#clear-all')
const startExportButton = document.querySelector<HTMLButtonElement>('#start-export')
const cancelExportButton = document.querySelector<HTMLButtonElement>('#cancel-export')
const chatSearch = document.querySelector<HTMLInputElement>('#chat-search')
const chatList = document.querySelector<HTMLDivElement>('#chat-list')
const selectionCount = document.querySelector<HTMLDivElement>('#selection-count')
const bulkPanel = document.querySelector<HTMLDivElement>('#bulk-panel')
let availableChats: Array<{ id: string; title?: string }> = []
const selectedChatIds = new Set<string>()

// Translation tables stay compact so the popup remains a single self-contained artifact.
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable pionxzh/consistent-list-newline */
const translations: Record<string, Record<string, string>> = {
    de: {
        appTitle: 'ChatGPT Exporter', rawEyebrow: 'Rohdaten · empfohlen', rawTitle: 'Aktuellen Chat sichern', rawHint: 'Originales ChatGPT-JSON für Archiv, Analyse und Second Brain.', rawDownload: '↓ Raw JSON herunterladen', formatsEyebrow: 'Weitere Formate', formatsTitle: 'Einzelchat exportieren', formatsHint: 'Abgeleitete Kopien für Lesen, Teilen oder Weiterverarbeitung.', clipboard: 'Text in Zwischenablage', multipleEyebrow: 'Mehrere Chats', multipleTitle: 'Export All', multipleHint: 'Wähle einzelne Chats oder alle aus. Jeder Download bleibt eine originale Raw-JSON-Datei.', chooseChats: 'Chats auswählen', searchChats: 'Chats suchen …', selectAll: 'Alle auswählen', clearAll: 'Auswahl leeren', selectedCount: 'Ausgewählt: {count}', downloadSelection: 'Auswahl herunterladen', cancel: 'Abbrechen', httpTitle: 'HTTP-Destination', endpoint: 'Endpoint', save: 'Speichern', test: 'Testen', sendCurrent: 'Aktuellen Chat senden', connection: 'Verbindung testen',
    },
    en: {
        appTitle: 'ChatGPT Exporter', rawEyebrow: 'Raw data · recommended', rawTitle: 'Save current chat', rawHint: 'Original ChatGPT JSON for archive, analysis and Second Brain.', rawDownload: '↓ Download raw JSON', formatsEyebrow: 'More formats', formatsTitle: 'Export single chat', formatsHint: 'Derived copies for reading, sharing or processing.', clipboard: 'Copy text to clipboard', multipleEyebrow: 'Multiple chats', multipleTitle: 'Export All', multipleHint: 'Select individual chats or all of them. Each download remains an original raw JSON file.', chooseChats: 'Choose chats', searchChats: 'Search chats …', selectAll: 'Select all', clearAll: 'Clear selection', selectedCount: 'Selected: {count}', downloadSelection: 'Download selection', cancel: 'Cancel', httpTitle: 'HTTP destination', endpoint: 'Endpoint', save: 'Save', test: 'Test', sendCurrent: 'Send current chat', connection: 'Test connection',
    },
    es: {
        appTitle: 'ChatGPT Exporter', rawEyebrow: 'Datos sin procesar · recomendado', rawTitle: 'Guardar chat actual', rawHint: 'JSON original de ChatGPT para archivo, análisis y Second Brain.', rawDownload: '↓ Descargar JSON original', formatsEyebrow: 'Más formatos', formatsTitle: 'Exportar un chat', formatsHint: 'Copias derivadas para leer, compartir o procesar.', clipboard: 'Copiar texto al portapapeles', multipleEyebrow: 'Varios chats', multipleTitle: 'Exportar todo', multipleHint: 'Selecciona chats individuales o todos. Cada descarga conserva el JSON original.', chooseChats: 'Elegir chats', searchChats: 'Buscar chats …', selectAll: 'Seleccionar todo', clearAll: 'Borrar selección', selectedCount: 'Seleccionados: {count}', downloadSelection: 'Descargar selección', cancel: 'Cancelar', httpTitle: 'Destino HTTP', endpoint: 'Endpoint', save: 'Guardar', test: 'Probar', sendCurrent: 'Enviar chat actual', connection: 'Probar conexión',
    },
}
/* eslint-enable pionxzh/consistent-list-newline */
const languageSelect = document.querySelector<HTMLSelectElement>('#language')

function applyLanguage(language: string) {
    const dictionary = translations[language] || translations.en
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
        const key = element.dataset.i18n
        if (key && dictionary[key]) element.textContent = dictionary[key]
    })
    document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach((element) => {
        const key = element.dataset.i18nPlaceholder
        if (key && dictionary[key]) element.placeholder = dictionary[key]
    })
    if (languageSelect) languageSelect.value = language
    updateSelectionCount(language)
}

let activeLanguage = 'de'
function updateSelectionCount(language = activeLanguage) {
    activeLanguage = language
    if (!selectionCount) return
    const template = (translations[language] || translations.en).selectedCount
    selectionCount.textContent = template.replace('{count}', String(selectedChatIds.size))
}

const browserLanguage = navigator.language.toLowerCase().startsWith('es') ? 'es' : navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en'
chrome.storage.local.get(['language']).then(settings => applyLanguage(typeof settings.language === 'string' && settings.language in translations ? settings.language : browserLanguage)).catch(() => applyLanguage(browserLanguage))
languageSelect?.addEventListener('change', async () => {
    const language = languageSelect.value
    applyLanguage(language)
    await chrome.storage.local.set({ language })
})
const endpointInput = document.querySelector<HTMLInputElement>('#endpoint')
const saveEndpointButton = document.querySelector<HTMLButtonElement>('#save-endpoint')
const sendEndpointButton = document.querySelector<HTMLButtonElement>('#send-endpoint')
const testEndpointButton = document.querySelector<HTMLButtonElement>('#test-endpoint')
const status = document.querySelector<HTMLParagraphElement>('#status')
function setStatus(message: string) {
    if (status) status.textContent = message
}

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
        setStatus(error instanceof Error ? error.message : 'Ungültiger Endpoint.')
        return
    }
    if (!await requestEndpointPermission(endpoint)) {
        setStatus('Kein Zugriff auf die Endpoint-Domain erteilt.')
        return
    }
    await chrome.storage.local.set({ httpEndpoint: endpoint })
    setStatus('Endpoint lokal gespeichert.')
})

sendEndpointButton?.addEventListener('click', async () => {
    if (!status) return
    setStatus('Sende Capture …')
    if (endpointInput) {
        let endpoint: string
        try {
            endpoint = validateEndpoint(endpointInput.value)
        }
        catch (error) {
            setStatus(error instanceof Error ? error.message : 'Ungültiger Endpoint.')
            return
        }
        if (!await requestEndpointPermission(endpoint)) {
            setStatus('Kein Zugriff auf die Endpoint-Domain erteilt.')
            return
        }
    }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) {
        setStatus('Kein aktiver Tab gefunden.')
        return
    }
    try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'SEND_CURRENT_TO_ENDPOINT' }) as { ok?: boolean; status?: number; errorMessage?: string } | undefined
        setStatus(response?.ok ? `Gesendet (HTTP ${response.status}).` : (response?.errorMessage || 'Versand fehlgeschlagen.'))
    }
    catch {
        setStatus('Diese Seite ist keine unterstützte ChatGPT-Seite.')
    }
})

async function requestEndpointPermission(endpoint: string): Promise<boolean> {
    const url = new URL(endpoint)
    return chrome.permissions.request({ origins: [`${url.origin}/*`] })
}

testEndpointButton?.addEventListener('click', async () => {
    if (!status) return
    setStatus('Teste HTTP-Endpoint …')
    try {
        if (endpointInput) {
            const endpoint = validateEndpoint(endpointInput.value)
            if (!await requestEndpointPermission(endpoint)) {
                setStatus('Kein Zugriff auf die Endpoint-Domain erteilt.')
                return
            }
        }
        const response = await chrome.runtime.sendMessage({ type: 'TEST_HTTP_ENDPOINT' }) as { ok?: boolean; status?: number; errorMessage?: string } | undefined
        setStatus(response?.ok ? `Endpoint erreichbar (HTTP ${response.status}).` : (response?.errorMessage || 'Endpoint-Test fehlgeschlagen.'))
    }
    catch {
        setStatus('Endpoint-Test fehlgeschlagen.')
    }
})

downloadButton?.addEventListener('click', async () => {
    if (!status) return
    setStatus('Lade aktuellen Chat …')
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) {
        setStatus('Kein aktiver Tab gefunden.')
        return
    }

    try {
        const response = await chrome.tabs.sendMessage(tab.id, {
            type: 'DOWNLOAD_CURRENT_CONVERSATION',
        }) as { ok?: boolean; fileName?: string; errorMessage?: string } | undefined
        setStatus(response?.ok
            ? `Heruntergeladen: ${response.fileName}`
            : (response?.errorMessage || 'Download fehlgeschlagen.'))
    }
    catch {
        setStatus('Diese Seite ist keine unterstützte ChatGPT-Seite.')
    }
})

button?.addEventListener('click', async () => {
    if (!status) return
    setStatus('Prüfe ChatGPT-Seite …')
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) {
        setStatus('Kein aktiver Tab gefunden.')
        return
    }

    try {
        const response = await chrome.tabs.sendMessage(tab.id, {
            type: 'POPUP_PING',
            requestId: createRequestId(),
        }) as { ok?: boolean } | undefined
        setStatus(response?.ok ? 'Extension-Shell ist verbunden.' : 'Keine Antwort erhalten.')
    }
    catch {
        setStatus('Diese Seite ist keine unterstützte ChatGPT-Seite.')
    }
})

document.querySelectorAll<HTMLButtonElement>('[data-export]').forEach((exportButton) => {
    exportButton.addEventListener('click', async () => {
        const format = exportButton.dataset.export
        if (!format) return
        setStatus('Erzeuge Export …')
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (!tab.id) {
            setStatus('Kein aktiver Tab gefunden.')
            return
        }
        try {
            const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXPORT_CURRENT', format }) as { ok?: boolean; fileName?: string; errorMessage?: string } | undefined
            setStatus(response?.ok ? (response.fileName ? `Exportiert: ${response.fileName}` : 'In Zwischenablage kopiert.') : (response?.errorMessage || 'Export fehlgeschlagen.'))
        }
        catch { setStatus('Diese Seite ist keine unterstützte ChatGPT-Seite.') }
    })
})

loadChatsButton?.addEventListener('click', async () => {
    setStatus('Lade Chatliste …')
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) {
        setStatus('Kein aktiver Tab gefunden.')
        return
    }
    try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'LIST_CONVERSATIONS' }) as { ok?: boolean; items?: Array<{ id: string; title?: string }>; errorMessage?: string } | undefined
        if (!response?.ok || !response.items) {
            setStatus(response?.errorMessage || 'Chatliste konnte nicht geladen werden.')
            return
        }
        availableChats = response.items
        selectedChatIds.clear()
        renderChatList()
        bulkPanel?.classList.add('visible')
        setStatus(`${availableChats.length} Chats geladen.`)
    }
    catch {
        setStatus('Diese Seite ist keine unterstützte ChatGPT-Seite.')
    }
})

function renderChatList() {
    if (!chatList) return
    const query = chatSearch?.value.trim().toLocaleLowerCase() || ''
    chatList.replaceChildren()
    updateSelectionCount()
    availableChats.filter(chat => !query || (chat.title || 'Unbenannter Chat').toLocaleLowerCase().includes(query)).forEach((chat) => {
        const label = document.createElement('label')
        label.className = 'chat-row'
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = selectedChatIds.has(chat.id)
        checkbox.addEventListener('change', () => checkbox.checked ? selectedChatIds.add(chat.id) : selectedChatIds.delete(chat.id))
        checkbox.addEventListener('change', () => updateSelectionCount())
        const title = document.createElement('span')
        title.className = 'chat-title'
        title.textContent = chat.title || 'Unbenannter Chat'
        label.append(checkbox, title)
        chatList.append(label)
    })
}

chatSearch?.addEventListener('input', renderChatList)
selectAllButton?.addEventListener('click', () => {
    availableChats.forEach(chat => selectedChatIds.add(chat.id))
    renderChatList()
    updateSelectionCount()
})
clearAllButton?.addEventListener('click', () => {
    selectedChatIds.clear()
    renderChatList()
    updateSelectionCount()
})
startExportButton?.addEventListener('click', async () => {
    if (selectedChatIds.size === 0) {
        setStatus('Bitte mindestens einen Chat auswählen.')
        return
    }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) {
        setStatus('Kein aktiver Tab gefunden.')
        return
    }
    setStatus(`Exportiere ${selectedChatIds.size} Chats …`)
    try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXPORT_SELECTED_RAW', ids: [...selectedChatIds] }) as { ok?: boolean; count?: number; cancelled?: boolean; errorMessage?: string } | undefined
        setStatus(response?.ok ? `${response.count ?? 0} Chats heruntergeladen${response.cancelled ? ' (abgebrochen).' : '.'}` : (response?.errorMessage || 'Export fehlgeschlagen.'))
    }
    catch { setStatus('Export fehlgeschlagen.') }
})
cancelExportButton?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) await chrome.tabs.sendMessage(tab.id, { type: 'CANCEL_EXPORT' }).catch(() => undefined)
    setStatus('Abbruch angefordert …')
})
