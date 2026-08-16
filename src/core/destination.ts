export interface ExportArtifact<T = unknown> {
    fileName: string
    mimeType: string
    content: T
}

export interface Destination<T = unknown> {
    deliver(artifact: ExportArtifact<T>): void | Promise<void>
}

export function createArtifact<T>(fileName: string, mimeType: string, content: T): ExportArtifact<T> {
    if (!fileName.trim()) throw new Error('Artifact filename must not be empty.')
    if (!mimeType.trim()) throw new Error('Artifact MIME type must not be empty.')
    return { fileName, mimeType, content }
}
