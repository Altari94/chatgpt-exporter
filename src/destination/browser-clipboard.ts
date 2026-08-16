import type { Destination, ExportArtifact } from '../core/destination'

export class BrowserClipboardDestination implements Destination<string> {
    async deliver(artifact: ExportArtifact<string>): Promise<void> {
        try {
            await navigator.clipboard.writeText(artifact.content)
        }
        catch {
            const textarea = document.createElement('textarea')
            textarea.value = artifact.content
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
        }
    }
}

export const browserClipboardDestination = new BrowserClipboardDestination()
