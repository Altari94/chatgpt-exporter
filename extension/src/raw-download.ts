import { captureResponse, rawText, withNormalization } from '../../src/core/capture'
import { CaptureError, fetchCurrentConversation } from './chatgpt-source'

export interface DownloadResult {
    ok: true
    fileName: string
}

export async function captureCurrentConversation(): Promise<DownloadResult> {
    const response = await fetchCurrentConversation()
    const record = captureResponse<Record<string, unknown>>(response.text, {
        kind: 'chatgpt-conversation',
        conversationId: response.conversationId,
        url: response.url,
    })
    const derived = withNormalization(record, raw => ({
        title: typeof raw.title === 'string' ? raw.title : 'ChatGPT Conversation',
        createTime: typeof raw.create_time === 'number' ? raw.create_time : undefined,
    }))
    const fileName = buildFileName(derived.normalized?.title, response.conversationId)
    downloadText(fileName, rawText(record))
    return { ok: true, fileName }
}

function buildFileName(title: string | undefined, conversationId: string): string {
    const safeTitle = (title || 'ChatGPT Conversation')
        .normalize('NFKC')
        .replace(/[\\/:*?"<>|]/g, '-')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100)
        || 'ChatGPT Conversation'
    return `${safeTitle}--${conversationId}.json`
}

function downloadText(fileName: string, text: string) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function formatCaptureError(error: unknown): string {
    if (error instanceof CaptureError) return error.message
    return 'Der Chat konnte nicht heruntergeladen werden.'
}
