import type { Destination, ExportArtifact } from '../core/destination'

type DownloadContent = string | Blob

export class BrowserDownloadDestination implements Destination<DownloadContent> {
    deliver(artifact: ExportArtifact<DownloadContent>): void {
        const blob = artifact.content instanceof Blob
            ? artifact.content
            : new Blob([artifact.content], { type: artifact.mimeType })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = artifact.fileName
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
}

export const browserDownloadDestination = new BrowserDownloadDestination()
