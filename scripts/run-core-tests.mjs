import { spawn } from 'node:child_process'
import { cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(root, '.tmp', 'core-tests')
const testSource = path.join(root, 'tests', 'core', 'capture.test.mjs')
const testTarget = path.join(outputDir, 'tests', 'core', 'capture.test.mjs')

await rm(outputDir, { recursive: true, force: true })
await run('corepack', ['pnpm', 'exec', 'tsc', '-p', 'tsconfig.tests.json'])
await mkdir(path.dirname(testTarget), { recursive: true })
await cp(testSource, testTarget)
await run(process.execPath, ['--test', testTarget])

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
