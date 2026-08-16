/** Error raised when the upstream API asks the client to slow down. */
export class RateLimitError extends Error {
    /** Milliseconds to wait before retrying. */
    readonly retryAfterMs: number

    constructor(retryAfterHeader: string | null) {
        super('Too Many Requests (429)')
        this.name = 'RateLimitError'
        const seconds = retryAfterHeader == null ? Number.NaN : Number.parseInt(retryAfterHeader, 10)
        this.retryAfterMs = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 30_000
    }
}
