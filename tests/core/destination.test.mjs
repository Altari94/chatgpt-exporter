import assert from 'node:assert/strict'
import test from 'node:test'
import { createArtifact } from '../../src/core/destination.js'

test('creates a typed export artifact without browser dependencies', () => {
    const artifact = createArtifact('conversation.json', 'application/json', '{"ok":true}')
    assert.deepEqual(artifact, {
        fileName: 'conversation.json',
        mimeType: 'application/json',
        content: '{"ok":true}',
    })
})

test('rejects incomplete artifact metadata', () => {
    assert.throws(() => createArtifact('', 'application/json', '{}'), /filename/)
    assert.throws(() => createArtifact('conversation.json', '', '{}'), /MIME type/)
})
