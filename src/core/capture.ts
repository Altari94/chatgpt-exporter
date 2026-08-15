/** Versioned, browser-independent representation of a captured response. */
export const CAPTURE_SCHEMA_VERSION = 1 as const

export interface CaptureSource {
    kind: string
    conversationId?: string
    url?: string
}

export interface RawCapture<T> {
    /** Exact response text. It is never rewritten by normalization. */
    text: string
    /** Parsed view of `text`, kept separately for consumers that need structure. */
    value: T
}

export interface CaptureRecord<T, N = unknown> {
    schemaVersion: typeof CAPTURE_SCHEMA_VERSION
    capturedAt: string
    source: CaptureSource
    raw: RawCapture<T>
    normalized?: N
}

export type RawParser<T> = (text: string) => T

/**
 * Creates a record from an HTTP/page response without changing its bytes.
 * Parsing errors are deliberately allowed to bubble up to the caller.
 */
export function captureResponse<T>(
    text: string,
    source: CaptureSource,
    parse: RawParser<T> = JSON.parse as RawParser<T>,
    now: () => string = () => new Date().toISOString(),
): CaptureRecord<T> {
    return {
        schemaVersion: CAPTURE_SCHEMA_VERSION,
        capturedAt: now(),
        source: { ...source },
        raw: {
            text,
            value: parse(text),
        },
    }
}

/**
 * Adds a derived representation. The normalizer receives a deep clone so it
 * cannot mutate either the parsed raw value or the original response text.
 */
export function withNormalization<T, N>(
    record: CaptureRecord<T>,
    normalize: (raw: T) => N,
): CaptureRecord<T, N> {
    const rawCopy = cloneJson(record.raw.value)
    return {
        ...record,
        raw: {
            ...record.raw,
            value: record.raw.value,
        },
        normalized: normalize(rawCopy),
    }
}

/** Returns the exact captured response, suitable for a raw JSON download. */
export function rawText<T>(record: CaptureRecord<T>): string {
    return record.raw.text
}

function cloneJson<T>(value: T): T {
    if (typeof structuredClone === 'function') return structuredClone(value)
    return JSON.parse(JSON.stringify(value)) as T
}
