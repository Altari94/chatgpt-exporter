import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { buildArchiveName, formatCreatedDate, slugifyTitle } from '../../dist-extension/archive-naming.js'
import { CaptureError, fetchAllConversationSummaries, fetchCurrentConversation, fetchMediaAsset, getConversationId } from '../../dist-extension/chatgpt-source.js'
import { renderMarkdownDocument } from '../../dist-extension/derived-export.js'
import { createCaptureEnvelope, sendEnvelope, testEndpoint, validateEndpoint } from '../../dist-extension/http-destination.js'
import { findMediaReferences, mediaFileName } from '../../dist-extension/media-assets.js'
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
    assert.equal(manifest.version, '1.0.0')
    assert.deepEqual(manifest.host_permissions, [
        'https://chatgpt.com/*',
        'https://chat.openai.com/*',
    ])
    assert.deepEqual(manifest.optional_host_permissions, ['http://*/*', 'https://*/*'])
    assert.deepEqual(manifest.optional_permissions, ['downloads'])
    assert.equal(manifest.background.service_worker, 'service-worker.js')
    assert.equal(manifest.icons['128'], 'icons/icon-128.png')
    assert.equal(manifest.action.default_icon['48'], 'icons/icon-48.png')
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

test('paginates Export All summaries and respects the maximum', async () => {
    const requests = []
    const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: `id-${index}`, title: `Chat ${index}` }))
    const summaries = await fetchAllConversationSummaries('https://chatgpt.com/c/current', 101, async (url) => {
        requests.push(String(url))
        if (String(url).endsWith('/api/auth/session')) return new Response(JSON.stringify({ accessToken: 'test-token' }), { status: 200 })
        if (String(url).includes('offset=0')) return new Response(JSON.stringify({ items: firstPage }), { status: 200 })
        return new Response(JSON.stringify({ items: [{ id: 'id-100', title: 'Chat 100' }, { id: 'id-101', title: 'Chat 101' }] }), { status: 200 })
    })
    assert.equal(summaries.length, 101)
    assert.equal(summaries.at(-1).id, 'id-100')
    assert.equal(requests.length, 3)
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

test('finds unique image assets without changing their JSON paths', () => {
    const references = findMediaReferences({
        mapping: {
            first: { message: { content: { parts: [{ content_type: 'image_asset_pointer', asset_pointer: 'sediment://file-a' }] } } },
            second: { message: { metadata: { aggregate_result: { messages: [{ image_url: 'https://files.example/image.png' }, { image_url: 'https://files.example/image.png' }] } } } },
        },
    })
    assert.equal(references.length, 2)
    assert.equal(references[0].pointer, 'sediment://file-a')
    assert.match(references[0].jsonPath, /mapping\.first/)
    assert.equal(mediaFileName(1, 'sediment://file-a', 'image/jpeg'), 'asset-001-file-a.jpg')
})

test('resolves a sediment image pointer through the authenticated file API', async () => {
    const requests = []
    const asset = await fetchMediaAsset('sediment://file-image', 'https://chatgpt.com/c/conversation-1', async (url, options) => {
        requests.push({ url: String(url), options })
        if (String(url).endsWith('/api/auth/session')) return new Response(JSON.stringify({ accessToken: 'test-token' }), { status: 200 })
        if (String(url).includes('/files/download/file-image')) return new Response(JSON.stringify({ download_url: 'https://files.example/image.jpg' }), { status: 200 })
        return new Response(new Blob(['image-bytes'], { type: 'image/jpeg' }), { status: 200, headers: { 'content-type': 'image/jpeg' } })
    })
    assert.equal(asset.mimeType, 'image/jpeg')
    assert.equal(await asset.blob.text(), 'image-bytes')
    assert.equal(requests.length, 3)
    assert.equal(requests[1].options.headers.Authorization, 'Bearer test-token')
})

test('creates stable, readable archive names with a short identifier', () => {
    assert.equal(formatCreatedDate(1755302400), '2025-08-16')
    assert.equal(slugifyTitle('Schweden Anfrage: Formulierung!'), 'Schweden-Anfrage-Formulierung')
    assert.deepEqual(buildArchiveName('Schweden Anfrage Formulierung', '6a81e30d-4178-83ed-8b2f-b95f46659447', 1755302400), {
        folder: 'ChatGPT Exporter/2025-08-16__Schweden-Anfrage-Formulierung__6a81e30d',
        fileName: '2025-08-16__Schweden-Anfrage-Formulierung__6a81e30d.json',
    })
})

test('renders Markdown with frontmatter and relative media links', () => {
    const markdown = renderMarkdownDocument({
        schemaVersion: 1,
        capturedAt: '2026-08-17T08:00:00.000Z',
        source: { kind: 'chatgpt-conversation', conversationId: 'conversation-1', url: 'https://chatgpt.com/c/conversation-1' },
        raw: {
            text: '{}',
            value: {
                title: 'Test chat',
                create_time: 1755302400,
                current_node: 'node-2',
                mapping: {
                    'node-1': { parent: null, message: { author: { role: 'user' }, content: { content_type: 'multimodal_text', parts: ['Hallo', { content_type: 'image_asset_pointer', asset_pointer: 'sediment://file-a' }] } } },
                    'node-2': { parent: 'node-1', message: { author: { role: 'assistant' }, content: { content_type: 'text', parts: ['Antwort'] } } },
                },
            },
        },
    }, 'Test chat', [], [{ pointer: 'sediment://file-a', relativePath: 'assets/asset-001.jpg', index: 1 }])
    assert.match(markdown, /conversation_id: "conversation-1"/)
    assert.match(markdown, /!\[Bild\]\(assets\/asset-001\.jpg\)/)
    assert.match(markdown, /raw_json: conversation\.json/)
})
