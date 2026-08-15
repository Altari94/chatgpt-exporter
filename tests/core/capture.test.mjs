import assert from 'node:assert/strict'
import test from 'node:test'
import { captureResponse, rawText, withNormalization } from '../../src/core/capture.js'

const responseText = '{"title":"Raw title","mapping":{"root":{"children":[]}}}'

test('preserves response text and parsed value separately', () => {
    const record = captureResponse(responseText, { kind: 'chatgpt', conversationId: 'c-1' }, JSON.parse, () => '2026-08-15T00:00:00.000Z')

    assert.equal(record.schemaVersion, 1)
    assert.equal(record.capturedAt, '2026-08-15T00:00:00.000Z')
    assert.equal(record.raw.text, responseText)
    assert.deepEqual(record.raw.value, { title: 'Raw title', mapping: { root: { children: [] } } })
    assert.equal(rawText(record), responseText)
})

test('normalization cannot mutate raw data', () => {
    const record = captureResponse(responseText, { kind: 'chatgpt' })
    const normalized = withNormalization(record, (raw) => {
        raw.title = 'Derived title'
        return { title: raw.title }
    })

    assert.equal(normalized.normalized?.title, 'Derived title')
    assert.equal(record.raw.value.title, 'Raw title')
    assert.equal(record.raw.text, responseText)
})

test('parsing errors are not hidden', () => {
    assert.throws(() => captureResponse('{not-json}', { kind: 'chatgpt' }), SyntaxError)
})
