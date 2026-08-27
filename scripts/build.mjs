import { build } from 'esbuild'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pluginRoot = repositoryRoot
const clientSource = resolve(pluginRoot, 'src/client/index.ts')
const clientOutput = resolve(pluginRoot, 'lib/client.js')
const hostSource = resolve(pluginRoot, 'src/index.ts')
const hostOutput = resolve(pluginRoot, 'lib/index.js')
const invariantSource = resolve(pluginRoot, 'src/invariant.ts')
const invariantOutput = resolve(pluginRoot, 'lib/invariant.js')
const moduleId = 'dsh-turn-continuation'

const client = await build({
  entryPoints: [clientSource],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  write: false,
  sourcemap: false,
  legalComments: 'none',
  external: ['react', 'react/jsx-runtime', '@deepseek-ai/*'],
  logLevel: 'silent',
})
const bundled = client.outputFiles.at(0)
if (bundled === undefined) throw new Error('Turn continuation client bundle did not produce JavaScript')
const clientArtifact = `window.__ModuleLoader__.load({\n  id: ${JSON.stringify(moduleId)},\n  factory: (require) => {\n    var module = { exports: {} }\n    var exports = module.exports\n${bundled.text}\n    return module.exports\n  },\n})\n`

await mkdir(dirname(clientOutput), { recursive: true })
await writeFile(clientOutput, clientArtifact)
for (const [source, output] of [[hostSource, hostOutput], [invariantSource, invariantOutput]]) {
  await build({
    entryPoints: [source],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    outfile: output,
    external: ['@deepseek-ai/*'],
    legalComments: 'none',
    logLevel: 'silent',
  })
}
console.log(`Built ${clientOutput}`)
console.log(`Built ${hostOutput}`)
console.log(`Built ${invariantOutput}`)
