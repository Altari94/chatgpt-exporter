import { spawn } from 'node:child_process'
import { cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(root, '.tmp', 'core-tests')
const testSources = [
    path.join(root, 'tests', 'core', 'capture.test.mjs'),
    path.join(root, 'tests', 'core', 'destination.test.mjs'),
]

await rm(outputDir, { recursive: true, force: true })
await run('corepack', ['pnpm', 'exec', 'tsc', '-p', 'tsconfig.tests.json'])
await mkdir(path.join(outputDir, 'tests', 'core'), { recursive: true })
for (const testSource of testSources) {
    await cp(testSource, path.join(outputDir, 'tests', 'core', path.basename(testSource)))
}
await run(process.execPath, ['--test', ...testSources.map(testSource => path.join(outputDir, 'tests', 'core', path.basename(testSource)))])

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
