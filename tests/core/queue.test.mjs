import assert from 'node:assert/strict'
import test from 'node:test'
import { RequestQueue } from '../../queue.mjs'

function waitForSummary(queue) {
    return new Promise((resolve) => {
        queue.on('summary', resolve)
    })
}

test('reports successful and exhausted requests separately', async () => {
    const queue = new RequestQueue(0, 0)
    let attempts = 0
    queue.add({
        name: 'ok',
        request: async () => 'saved',
    })
    queue.add({
        name: 'broken',
        request: async () => {
            attempts++
            throw new Error('server unavailable')
        },
    })

    const summaryPromise = waitForSummary(queue)
    queue.start()
    const summary = await summaryPromise

    assert.equal(attempts, 6)
    assert.equal(summary.total, 2)
    assert.equal(summary.completed, 2)
    assert.deepEqual(summary.succeeded, ['saved'])
    assert.deepEqual(summary.failed, [{ name: 'broken', attempts: 6, error: 'server unavailable' }])
    assert.deepEqual(summary.pending, [])
})

test('marks queued and in-flight work as pending when stopped', async () => {
    const queue = new RequestQueue(0, 0)
    let release
    queue.add({
        name: 'in-flight',
        request: () => new Promise((resolve) => {
            release = resolve
        }),
    })
    queue.add({
        name: 'queued',
        request: async () => 'never',
    })

    const summaryPromise = waitForSummary(queue)
    queue.start()
    await new Promise(resolve => setImmediate(resolve))
    queue.stop()
    release('done')
    const summary = await summaryPromise

    assert.equal(summary.stopped, true)
    assert.deepEqual(summary.succeeded, [])
    assert.deepEqual(summary.pending, ['in-flight', 'queued'])
})

test('does not retry permanent request errors', async () => {
    const queue = new RequestQueue(0, 0)
    let attempts = 0
    queue.add({
        name: 'missing',
        request: async () => {
            attempts++
            throw new Error('Not Found')
        },
    })

    const summaryPromise = waitForSummary(queue)
    queue.start()
    const summary = await summaryPromise

    assert.equal(attempts, 1)
    assert.deepEqual(summary.failed, [{ name: 'missing', attempts: 1, error: 'Not Found' }])
})
