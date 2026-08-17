import { captureResponse, rawText, withNormalization } from '../../src/core/capture'
import { buildArchiveName } from './archive-naming'
import { CaptureError, fetchConversationById, fetchCurrentConversation, fetchMediaAsset } from './chatgpt-source'
import { renderMarkdownDocument } from './derived-export'
import { type MediaAssetResult, findMediaReferences, mediaFileName } from './media-assets'

export interface DownloadResult {
    ok: true
    fileName: string
    markdownFileName?: string
    media: MediaAssetResult[]
}

export interface DownloadOptions {
    useFolder?: boolean
}

export async function captureCurrentConversationRecord() {
    const response = await fetchCurrentConversation()
    return captureResponse<Record<string, unknown>>(response.text, {
        kind: 'chatgpt-conversation',
        conversationId: response.conversationId,
        url: response.url,
    })
}

export async function captureCurrentConversation(options: DownloadOptions = {}): Promise<DownloadResult> {
    const record = await captureCurrentConversationRecord()
    const derived = withNormalization(record, raw => ({
        title: typeof raw.title === 'string' ? raw.title : 'ChatGPT Conversation',
        createTime: typeof raw.create_time === 'number' ? raw.create_time : undefined,
    }))
    const archive = buildArchiveName(derived.normalized?.title, record.source.conversationId ?? 'conversation', derived.normalized?.createTime)
    const fileName = options.useFolder ? `${archive.folder}/conversation.json` : archive.fileName
    await downloadText(fileName, rawText(record), 'application/json;charset=utf-8', options.useFolder === true)
    const media = await downloadMediaAssets(record.raw.value, fileName, options.useFolder === true ? archive.folder : undefined)
    const markdownFileName = options.useFolder ? `${archive.folder}/conversation.md` : undefined
    if (markdownFileName) await downloadMarkdown(record, derived.normalized?.title || 'ChatGPT Conversation', media, markdownFileName)
    return { ok: true, fileName, markdownFileName, media }
}

export async function captureConversationById(conversationId: string, options: DownloadOptions = {}): Promise<DownloadResult> {
    const response = await fetchConversationById(conversationId)
    const record = captureResponse<Record<string, unknown>>(response.text, {
        kind: 'chatgpt-conversation',
        conversationId: response.conversationId,
        url: response.url,
    })
    const title = typeof record.raw.value.title === 'string' ? record.raw.value.title : 'ChatGPT Conversation'
    const archive = buildArchiveName(title, conversationId, record.raw.value.create_time)
    const fileName = options.useFolder ? `${archive.folder}/conversation.json` : archive.fileName
    await downloadText(fileName, rawText(record), 'application/json;charset=utf-8', options.useFolder === true)
    const media = await downloadMediaAssets(record.raw.value, fileName, options.useFolder === true ? archive.folder : undefined)
    const markdownFileName = options.useFolder ? `${archive.folder}/conversation.md` : undefined
    if (markdownFileName) await downloadMarkdown(record, title, media, markdownFileName)
    return { ok: true, fileName, markdownFileName, media }
}

export async function downloadCurrentConversationJson(): Promise<{ ok: true; fileName: string }> {
    const record = await captureCurrentConversationRecord()
    const title = typeof record.raw.value.title === 'string' ? record.raw.value.title : 'ChatGPT Conversation'
    const archive = buildArchiveName(title, record.source.conversationId ?? 'conversation', record.raw.value.create_time)
    await downloadText(archive.fileName, rawText(record), 'application/json;charset=utf-8', false)
    return { ok: true, fileName: archive.fileName }
}

async function downloadMarkdown(record: Awaited<ReturnType<typeof captureCurrentConversationRecord>>, title: string, media: MediaAssetResult[], fileName: string) {
    const links = media.filter(asset => asset.status === 'downloaded' && asset.fileName).map(asset => ({
        pointer: asset.pointer,
        index: asset.index,
        relativePath: `assets/${asset.fileName?.split('/assets/').pop()}`,
    }))
    const rendered = renderMarkdownDocument(record, title, [], links)
    await downloadText(fileName, rendered, 'text/markdown;charset=utf-8', true)
}

async function downloadMediaAssets(value: unknown, jsonFileName: string, folder?: string): Promise<MediaAssetResult[]> {
    const references = findMediaReferences(value)
    if (references.length === 0) return []

    const results: MediaAssetResult[] = []
    for (const reference of references) {
        try {
            const asset = await fetchMediaAsset(reference.pointer)
            const assetName = mediaFileName(reference.index, reference.pointer, asset.mimeType)
            const fileName = folder ? `${folder}/assets/${assetName}` : assetName
            await downloadBlob(fileName, asset.blob, asset.mimeType, folder !== undefined)
            results.push({ ...reference, fileName, mimeType: asset.mimeType, bytes: asset.blob.size, status: 'downloaded' })
        }
        catch (error) {
            results.push({ ...reference, status: 'failed', error: error instanceof Error ? error.message : 'Bild konnte nicht geladen werden.' })
        }
    }

    const manifestName = jsonFileName.replace(/\.json$/i, '.media.json')
    await downloadText(folder ? `${folder}/media.json` : manifestName, JSON.stringify({ schemaVersion: 1, sourceJson: jsonFileName, assets: results }, null, 2), 'application/json;charset=utf-8', folder !== undefined)
    return results
}

async function downloadText(fileName: string, text: string, mimeType: string, useFolder: boolean) {
    const blob = new Blob([text], { type: mimeType })
    if (useFolder) {
        await downloadWithChromeApi(fileName, blob)
        return
    }
    downloadWithAnchor(fileName, blob)
}

async function downloadBlob(fileName: string, blob: Blob, mimeType: string, useFolder: boolean) {
    const output = new Blob([blob], { type: mimeType })
    if (useFolder) {
        await downloadWithChromeApi(fileName, output)
        return
    }
    downloadWithAnchor(fileName, output)
}

async function downloadWithChromeApi(fileName: string, blob: Blob) {
    const url = await blobToDataUrl(blob)
    const response = await chrome.runtime.sendMessage({ type: 'DOWNLOAD_FILE', filename: fileName, dataUrl: url }) as { ok?: boolean; errorMessage?: string } | undefined
    if (!response?.ok) throw new Error(response?.errorMessage || 'Datei konnte nicht gespeichert werden.')
}

function downloadWithAnchor(fileName: string, blob: Blob) {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error('Die Datei konnte nicht für den Download vorbereitet werden.'))
        reader.readAsDataURL(blob)
    })
}

export function formatCaptureError(error: unknown): string {
    if (error instanceof CaptureError) return error.message
    return 'Der Chat konnte nicht heruntergeladen werden.'
}
