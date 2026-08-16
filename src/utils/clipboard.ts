import { createArtifact } from '../core/destination'
import { browserClipboardDestination } from '../destination/browser-clipboard'

export function copyToClipboard(text: string) {
    browserClipboardDestination.deliver(createArtifact('clipboard.txt', 'text/plain', text)).catch(() => undefined)
}
