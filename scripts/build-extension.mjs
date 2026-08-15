import { spawn } from 'node:child_process'
import { cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'extension')
const compiled = path.join(root, '.tmp', 'extension-build')
const output = path.join(root, 'dist-extension')

await rm(output, { recursive: true, force: true })
await run('corepack', ['pnpm', 'exec', 'tsc', '-p', 'tsconfig.extension.json'])
await mkdir(output, { recursive: true })
await cp(compiled, output, { recursive: true })
await cp(path.join(source, 'manifest.json'), path.join(output, 'manifest.json'))
await cp(path.join(source, 'popup.html'), path.join(output, 'popup.html'))

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
