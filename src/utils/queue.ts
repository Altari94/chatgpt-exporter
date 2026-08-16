import EventEmitter from 'mitt'
import { RateLimitError } from '../core/rate-limit'
import { sleep } from './utils'

type RequestFn<T> = () => Promise<T>

/** Public shape callers pass to `add()` */
interface RequestObject<T> {
    name: string
    request: RequestFn<T>
}

export interface RequestFailure {
    name: string
    attempts: number
    error: string
}

export interface QueueSummary<T> {
    total: number
    completed: number
    succeeded: T[]
    failed: RequestFailure[]
    pending: string[]
    stopped: boolean
}

/** Internal shape with per-item retry counters */
interface InternalRequestObject<T> extends RequestObject<T> {
    retries: number // general error retries
    rateRetries: number // 429-specific retries
}

export type RequestStatus = 'processing' | 'retrying' | 'rate_limited'

interface ProgressEvent {
    total: number
    completed: number
    currentName: string
    currentStatus: RequestStatus
    /** Seconds remaining in a rate-limit pause (only set when status === 'rate_limited') */
    rateLimitWaitSecs?: number
    succeeded: number
    failed: number
}

/** Max retries for generic (non-429) errors before skipping a single request */
const MAX_RETRIES = 5
/**
 * Max times the entire queue can be globally paused for rate limiting before
 * giving up and stopping the queue entirely.
 */
const MAX_GLOBAL_PAUSES = 5
/**
 * Default pause length (ms) applied to the whole queue on a 429.
 * Used when the API does not return a Retry-After header.
 */
const DEFAULT_429_PAUSE_MS = 60_000

export class RequestQueue<T> {
    private eventEmitter = EventEmitter<{
        done: T[]
        progress: ProgressEvent
        summary: QueueSummary<T>
    }>()

    private queue: Array<InternalRequestObject<T>> = []
    private results: T[] = []
    private failures: RequestFailure[] = []
    private summaryEmitted = false
    private activeRequest: InternalRequestObject<T> | null = null

    private status: 'IDLE' | 'IN_PROGRESS' | 'STOPPED' | 'COMPLETED' = 'IDLE'

    private readonly backoffMultiplier = 2
    private backoff: number

    private total = 0
    private completed = 0

    /**
     * Timestamp (ms since epoch) until which the whole queue is frozen after
     * receiving a 429. While Date.now() < pauseUntil every process() iteration
     * waits out the remainder before making the next request.
     */
    private pauseUntil = 0
    /** How many global rate-limit pauses have been applied so far */
    private globalPauses = 0

    constructor(private minBackoff: number, private maxBackoff: number) {
        this.backoff = minBackoff
    }

    add(requestObject: RequestObject<T>) {
        this.queue.push({ ...requestObject, retries: 0, rateRetries: 0 })
    }

    start() {
        if (this.status === 'IDLE') {
            this.total = this.queue.length
            this.summaryEmitted = false
            this.process()
        }
    }

    stop() {
        if (this.status === 'STOPPED' || this.status === 'COMPLETED') return
        this.status = 'STOPPED'
        this.finish()
    }

    clear() {
        this.queue = []
        this.results = []
        this.failures = []
        this.summaryEmitted = false
        this.activeRequest = null
        this.status = 'IDLE'
        this.backoff = this.minBackoff
        this.pauseUntil = 0
        this.globalPauses = 0
        this.total = 0
        this.completed = 0
    }

    on(event: 'progress', fn: (progress: ProgressEvent) => void): () => void
    on(event: 'done', fn: (result: T[]) => void): () => void
    on(event: 'summary', fn: (summary: QueueSummary<T>) => void): () => void
    on(event: 'progress' | 'done' | 'summary', fn: (value: never) => void): () => void {
        this.eventEmitter.on(event, fn as never)
        return () => this.eventEmitter.off(event, fn as never)
    }

    private async process() {
        if (this.status === 'STOPPED' || this.status === 'COMPLETED') {
            return
        }

        if (this.queue.length === 0) {
            this.finish()
            return
        }

        // ── Global rate-limit pause ──────────────────────────────────────────
        // If a previous request set pauseUntil, wait for the remainder before
        // making any new request. This freezes the whole queue at once instead
        // of per-item retries, so 100 queued items don't each wait 30s in turn.
        const remaining = this.pauseUntil - Date.now()
        if (remaining > 0) {
            const waitSecs = Math.ceil(remaining / 1000)
            // Broadcast the pause status for every item currently at the front
            this.progress(this.queue[0].name, 'rate_limited', waitSecs)
            await sleep(remaining)
            this.pauseUntil = 0
        }

        this.status = 'IN_PROGRESS'
        const requestObject = this.queue.shift()!
        this.activeRequest = requestObject
        const { name, request } = requestObject

        let waitMs = this.backoff

        try {
            this.progress(name, 'processing')
            const result = await request()
            if (this.isStopped()) return
            this.results.push(result)
            this.completed++
            this.progress(name, 'processing')
            this.backoff = this.minBackoff // reset on success
            requestObject.retries = 0
        }
        catch (error) {
            if (this.isStopped()) return
            if (error instanceof RateLimitError) {
                this.globalPauses++
                if (this.globalPauses > MAX_GLOBAL_PAUSES) {
                    // Rate limit persists even after several long pauses — abort.
                    console.warn('[Exporter] Queue stopped: API rate limit did not clear after', MAX_GLOBAL_PAUSES, 'pauses')
                    this.recordFailure(requestObject, error)
                    this.activeRequest = null
                    this.stop()
                    return
                }
                // Freeze the whole queue. Exponentially increase the pause so
                // we back off harder if the first pause wasn't long enough.
                const pauseMs = Math.max(
                    error.retryAfterMs,
                    DEFAULT_429_PAUSE_MS * this.globalPauses,
                )
                this.pauseUntil = Date.now() + pauseMs
                this.progress(name, 'rate_limited', Math.round(pauseMs / 1000))
                console.warn(`[Exporter] Rate limited (429). Pausing queue for ${Math.round(pauseMs / 1000)}s (pause #${this.globalPauses})`)
                // Put this item back — it will be retried after the pause clears
                this.queue.unshift(requestObject)
                this.activeRequest = null
                waitMs = 0 // the sleep is handled at the top of the next process() call
            }
            else {
                console.error(`[Exporter] "${name}" failed:`, error)
                requestObject.retries++
                if (!isRetryableError(error) || requestObject.retries > MAX_RETRIES) {
                    console.warn(`[Exporter] "${name}" marked as failed after ${requestObject.retries} attempt(s)`)
                    this.recordFailure(requestObject, error)
                    this.activeRequest = null
                    this.completed++
                    waitMs = 0 // skip — don't re-queue
                }
                else {
                    this.backoff = Math.min(this.backoff * this.backoffMultiplier, this.maxBackoff)
                    waitMs = this.backoff
                    this.progress(name, 'retrying')
                    this.queue.unshift(requestObject)
                    this.activeRequest = null
                }
            }
        }

        if (this.isStopped()) return
        this.activeRequest = null

        await sleep(waitMs)
        this.process()
    }

    private progress(name: string, status: RequestStatus, rateLimitWaitSecs?: number) {
        this.eventEmitter.emit('progress', {
            total: this.total,
            completed: this.completed,
            currentName: name,
            currentStatus: status,
            rateLimitWaitSecs,
            succeeded: this.results.length,
            failed: this.failures.length,
        })
    }

    private recordFailure(requestObject: InternalRequestObject<T>, error: unknown) {
        this.failures.push({
            name: requestObject.name,
            attempts: Math.max(1, requestObject.retries),
            error: error instanceof Error ? error.message : String(error),
        })
    }

    private isStopped() {
        return this.status === 'STOPPED'
    }

    private finish() {
        if (this.summaryEmitted) return
        this.summaryEmitted = true
        const stopped = this.status === 'STOPPED'
        this.status = 'COMPLETED'
        this.eventEmitter.emit('done', this.results)
        this.eventEmitter.emit('summary', {
            total: this.total,
            completed: this.completed,
            succeeded: [...this.results],
            failed: [...this.failures],
            pending: [
                ...(this.activeRequest ? [this.activeRequest.name] : []),
                ...this.queue.map(request => request.name),
            ],
            stopped,
        })
    }
}

function isRetryableError(error: unknown): boolean {
    if (error instanceof TypeError) return true
    if (!(error instanceof Error)) return false
    return /network|timeout|temporar|unavailable|server|5\d\d/i.test(error.message)
}
