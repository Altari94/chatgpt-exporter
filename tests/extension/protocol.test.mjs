import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { MESSAGE_SOURCE, isCaptureTestRequest, isCaptureTestResult } from '../../.tmp/extension-build/protocol.js'

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
