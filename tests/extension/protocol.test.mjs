import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { CaptureError, fetchCurrentConversation, getConversationId } from '../../dist-extension/chatgpt-source.js'
import { createCaptureEnvelope, sendEnvelope, testEndpoint, validateEndpoint } from '../../dist-extension/http-destination.js'
import { MESSAGE_SOURCE, isCaptureTestRequest, isCaptureTestResult } from '../../dist-extension/protocol.js'

test('accepts only valid page bridge requests', () => {
    assert.equal(isCaptureTestRequest({
        source: MESSAGE_SOURCE,
        type: 'CAPTURE_TEST_REQUEST',
        requestId: 'request-1',
        payload: { message: 'ping' },
    }), true)
    assert.equal(isCaptureTestRequest({ type: 'CAPTURE_TEST_REQUEST', requestId: 'request-1' }), false)
})

test('accepts only valid bridge results', () => {
    assert.equal(isCaptureTestResult({
        source: MESSAGE_SOURCE,
        type: 'CAPTURE_TEST_RESULT',
        requestId: 'request-1',
        ok: true,
    }), true)
    assert.equal(isCaptureTestResult({
        source: MESSAGE_SOURCE,
        type: 'CAPTURE_TEST_RESULT',
        requestId: 'request-1',
        ok: 'yes',
    }), false)
})

test('build output has narrow MV3 permissions', async () => {
    const manifest = JSON.parse(await readFile('dist-extension/manifest.json', 'utf8'))

    assert.equal(manifest.manifest_version, 3)
    assert.deepEqual(manifest.host_permissions, [
        'https://chatgpt.com/*',
        'https://chat.openai.com/*',
    ])
    assert.deepEqual(manifest.optional_host_permissions, ['http://*/*', 'https://*/*'])
    assert.equal(manifest.background.service_worker, 'service-worker.js')
    assert.deepEqual(manifest.content_scripts[0].js, ['content.js'])
    assert.equal(manifest.web_accessible_resources[0].resources[0], 'page-bridge.js')
})

test('extracts the current conversation and preserves response text', async () => {
    const responseText = '{"title":"Raw","mapping":{}}'
    assert.equal(getConversationId('https://chatgpt.com/c/conversation-1'), 'conversation-1')
    assert.throws(() => getConversationId('https://chatgpt.com/'), CaptureError)

    const requested = []
    const capture = await fetchCurrentConversation('https://chatgpt.com/c/conversation-1', async (url, options) => {
        requested.push({ url: String(url), options })
        if (String(url).endsWith('/api/auth/session')) {
            return new Response(JSON.stringify({ accessToken: 'test-token' }), { status: 200 })
        }
        return new Response(responseText, { status: 200 })
    })

    assert.equal(requested[0].url, 'https://chatgpt.com/api/auth/session')
    assert.equal(requested[1].url, 'https://chatgpt.com/backend-api/conversation/conversation-1')
    assert.equal(requested[1].options.headers.Authorization, 'Bearer test-token')
    assert.equal(capture.text, responseText)
    assert.deepEqual(capture.value, { title: 'Raw', mapping: {} })
})

test('creates a versioned raw capture envelope without losing source data', () => {
    const envelope = createCaptureEnvelope({
        source: { kind: 'chatgpt-web', conversationId: 'conversation-1', url: 'https://chatgpt.com/c/conversation-1' },
        raw: { text: '{"mapping":{}}', value: { mapping: {} } },
    })
    assert.deepEqual(envelope, {
        schemaVersion: 1,
        source: { kind: 'chatgpt-web', conversationId: 'conversation-1', url: 'https://chatgpt.com/c/conversation-1' },
        raw: { text: '{"mapping":{}}', value: { mapping: {} } },
    })
})

test('sends an explicit JSON POST and reports successful status', async () => {
    const requests = []
    const result = await sendEnvelope('https://example.test/captures', { schemaVersion: 1, source: { kind: 'chatgpt-web', conversationId: 'id', url: 'https://chatgpt.com/c/id' }, raw: { text: '{}', value: {} } }, async (url, options) => {
        requests.push({ url: String(url), options })
        return new Response('', { status: 202 })
    })
    assert.deepEqual(result, { ok: true, status: 202 })
    assert.equal(requests[0].options.method, 'POST')
    assert.equal(requests[0].options.headers['content-type'], 'application/json')
    assert.deepEqual(JSON.parse(requests[0].options.body), { schemaVersion: 1, source: { kind: 'chatgpt-web', conversationId: 'id', url: 'https://chatgpt.com/c/id' }, raw: { text: '{}', value: {} } })
})

test('rejects unsafe endpoint schemes and non-success responses', async () => {
    assert.throws(() => validateEndpoint('file:///tmp/capture.json'), /http/)
    await assert.rejects(() => sendEnvelope('https://example.test/captures', { schemaVersion: 1, source: { kind: 'chatgpt-web', conversationId: '', url: '' }, raw: { text: '', value: {} } }, async () => new Response('', { status: 503 })), /HTTP 503/)
})

test('aborts requests after the configured timeout', async () => {
    await assert.rejects(() => sendEnvelope('https://example.test/captures', { schemaVersion: 1, source: { kind: 'chatgpt-web', conversationId: '', url: '' }, raw: { text: '', value: {} } }, async (_url, options) => new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    }), 1), /nicht rechtzeitig/)
})

test('tests endpoint reachability with GET', async () => {
    const result = await testEndpoint('https://example.test/health', async (_url, options) => {
        assert.equal(options.method, 'GET')
        return new Response('', { status: 200 })
    })
    assert.deepEqual(result, { ok: true, status: 200 })
})
