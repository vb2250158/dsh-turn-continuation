import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

test('published Host and Client declaration entries accept valid consumers and reject invalid requests', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'turn-declaration-consumer-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const file = join(directory, 'consumer.mts')
  await writeFile(file, `
    import { apply as hostApply, type TurnContinuationRequest, type TurnContinuationResult } from 'dsh-turn-continuation'
    import { apply as clientApply, inject } from 'dsh-turn-continuation/client'
    const request: TurnContinuationRequest = { sessionId: 'example-session' }
    const result: TurnContinuationResult = { accepted: true }
    const slots: string[] = inject
    let hostReturn: ReturnType<typeof hostApply> = undefined
    let disposer: ReturnType<typeof clientApply> = Promise.resolve(async () => {})
    // @ts-expect-error session identities must be strings
    const invalidRequest: TurnContinuationRequest = { sessionId: 42 }
    // @ts-expect-error admission receipts only represent acceptance
    const invalidReceipt: TurnContinuationResult = { accepted: false }
    // @ts-expect-error clients return an asynchronous disposer
    disposer = Promise.resolve(() => 42)
    void [request, result, slots, hostReturn, disposer, invalidRequest, invalidReceipt]
  `)
  const options = { noEmit: true, strict: true, skipLibCheck: true,
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext,
    paths: { 'dsh-turn-continuation': [join(root, 'lib/types/index.d.ts')],
      'dsh-turn-continuation/client': [join(root, 'lib/types/client/index.d.ts')] } }
  const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([file], options))
  assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: value => value, getCurrentDirectory: () => directory, getNewLine: () => '\n',
  }))
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  assert.equal(pkg.exports['.'].types, './lib/types/index.d.ts')
  assert.equal(pkg.exports['./client'].types, './lib/types/client/index.d.ts')
})
