import { spawn } from 'node:child_process'
import { cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'extension')
const output = path.join(root, 'dist-extension')

await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
await run('corepack', ['pnpm', 'exec', 'tsc', '--noEmit', '-p', 'tsconfig.extension.json'])
await build({
    entryPoints: {
        'content': path.join(root, 'extension/src/content.ts'),
        'page-bridge': path.join(root, 'extension/src/page-bridge.ts'),
        'popup': path.join(root, 'extension/src/popup.ts'),
        'service-worker': path.join(root, 'extension/src/service-worker.ts'),
    },
    bundle: true,
    format: 'iife',
    outdir: output,
    platform: 'browser',
    target: 'chrome120',
})
await build({
    entryPoints: [path.join(root, 'extension/src/protocol.ts')],
    bundle: true,
    format: 'esm',
    outfile: path.join(output, 'protocol.js'),
    platform: 'browser',
    target: 'chrome120',
})
await build({
    entryPoints: [path.join(root, 'extension/src/chatgpt-source.ts')],
    bundle: true,
    format: 'esm',
    outfile: path.join(output, 'chatgpt-source.js'),
    platform: 'browser',
    target: 'chrome120',
})
await build({
    entryPoints: [path.join(root, 'extension/src/http-destination.ts')],
    bundle: true,
    format: 'esm',
    outfile: path.join(output, 'http-destination.js'),
    platform: 'browser',
    target: 'chrome120',
})
await cp(path.join(source, 'manifest.json'), path.join(output, 'manifest.json'))
await cp(path.join(source, 'popup.html'), path.join(output, 'popup.html'))
await cp(path.join(source, 'icons'), path.join(output, 'icons'), { recursive: true })

console.log(`Extension built at ${path.relative(root, output)}`)

function run(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { cwd: root, stdio: 'inherit' })
        child.on('error', reject)
        child.on('exit', (code) => {
            if (code === 0) resolve()
            else reject(new Error(`${command} exited with code ${code}`))
        })
    })
}
