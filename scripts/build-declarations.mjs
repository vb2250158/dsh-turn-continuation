import ts from 'typescript'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

/** Emit each public face from its annotated source without combining Host and Client contexts. */
export async function buildDeclarations(root) {
  for (const [source, output] of [['src/index.ts', 'lib/types/index.d.ts'], ['src/client/index.ts', 'lib/types/client/index.d.ts']]) {
    const fileName = resolve(root, source)
    const result = ts.transpileDeclaration(await readFile(fileName, 'utf8'), {
      fileName, reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    })
    const errors = result.diagnostics.filter(value => value.category === ts.DiagnosticCategory.Error)
    if (errors.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(errors, {
      getCanonicalFileName: value => value, getCurrentDirectory: () => root, getNewLine: () => '\n',
    }))
    const destination = resolve(root, output)
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, result.outputText)
  }
}
