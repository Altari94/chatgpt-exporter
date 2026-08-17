import { spawn } from 'node:child_process'
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const version = packageJson.version
const output = path.join(root, 'dist-release', `chatgpt-exporter-v${version}`)
const archive = path.join(root, 'dist-release', `chatgpt-exporter-v${version}.zip`)

await rm(output, { recursive: true, force: true })
await rm(archive, { force: true })
await mkdir(output, { recursive: true })
await run('corepack', ['pnpm', 'run', 'build:extension'])
await cp(path.join(root, 'dist-extension'), path.join(output, 'extension'), { recursive: true })
await writeFile(path.join(output, 'RELEASE-METADATA.json'), `${JSON.stringify({
    name: 'ChatGPT Exporter',
    version,
    primaryArtifact: 'extension',
    legacyArtifact: null,
    legacyNote: 'The upstream-compatible userscript remains in the source repository and is not shipped in Chrome extension releases.',
    buildCommands: ['corepack pnpm install --frozen-lockfile', 'corepack pnpm release:build'],
}, null, 2)}\n`)
await writeReleaseArchive(output, archive)

console.log(`Release artifacts built at ${path.relative(root, output)} and ${path.relative(root, archive)}`)

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

async function writeReleaseArchive(directory, destination) {
    const zip = new JSZip()

    async function addDirectory(currentDirectory) {
        for (const entry of await readdir(currentDirectory)) {
            const absolutePath = path.join(currentDirectory, entry)
            const relativePath = path.relative(path.dirname(directory), absolutePath).split(path.sep).join('/')
            if ((await stat(absolutePath)).isDirectory()) {
                await addDirectory(absolutePath)
            }
            else {
                zip.file(relativePath, await readFile(absolutePath))
            }
        }
    }

    await addDirectory(directory)
    await writeFile(destination, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }))
}
