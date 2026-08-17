import { spawn } from 'node:child_process'
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const version = '0.10.0'
const output = path.join(root, 'dist-release', `chatgpt-exporter-v${version}`)

await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
await run('corepack', ['pnpm', 'run', 'build'])
await run('corepack', ['pnpm', 'run', 'build:extension'])
await cp(path.join(root, 'dist-extension'), path.join(output, 'extension'), { recursive: true })
await mkdir(path.join(output, 'legacy-userscript'), { recursive: true })
await cp(path.join(root, 'dist', 'chatgpt.user.js'), path.join(output, 'legacy-userscript', 'chatgpt.user.js'))
await writeFile(path.join(output, 'RELEASE-METADATA.json'), `${JSON.stringify({
    name: 'ChatGPT Exporter',
    version,
    primaryArtifact: 'extension',
    legacyArtifact: 'legacy-userscript/chatgpt.user.js',
    buildCommands: ['corepack pnpm install --frozen-lockfile', 'corepack pnpm release:build'],
}, null, 2)}\n`)

console.log(`Release artifacts built at ${path.relative(root, output)}`)

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
