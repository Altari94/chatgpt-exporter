import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { CaptureError, fetchCurrentConversation, getConversationId } from '../../dist-extension/chatgpt-source.js'
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
