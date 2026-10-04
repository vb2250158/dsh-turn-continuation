import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const clientBundleFile = new URL('../lib/client.js', import.meta.url)
const clientBundleUrl = clientBundleFile.href

async function loadClientBundle() {
  let loaded
  const previousWindow = globalThis.window
  globalThis.window = { __ModuleLoader__: { load: value => { loaded = value } } }
  try {
    await import(`${clientBundleUrl}?test=${Date.now()}-${Math.random()}`)
    assert.equal(loaded?.id, 'dsh-turn-continuation')
    return loaded.factory(id => {
      if (id === 'react') return { useState: () => [false, () => {}] }
      if (id === 'react/jsx-runtime') return { jsx: () => null, jsxs: () => null }
      if (id === '@deepseek-ai/dsh-client-ui-primitives') return { Button: 'DshButton' }
      throw new Error(`Unexpected turn continuation client dependency: ${id}`)
    })
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
}

test('中断任务继续浏览器模块通过 Host Remote 直接续接，不写入用户输入气泡', async () => {
  const client = await loadClientBundle()
  assert.deepEqual(client.inject, ['slots', 'remote'])
  const registrations = []
  const calls = []
  const ctx = {
    remote: { $mount: async descriptor => { calls.push({ kind: 'mount', descriptor }); return async () => {} } },
    reflect: { get: name => name === 'remote.turnContinuation' ? {
      continue: async request => { calls.push({ kind: 'continue', request }); return { ok: true, value: { accepted: true } } },
    } : undefined },
    slots: {
      inject: (_name, install) => install(),
      register: (options, component) => { registrations.push({ options, component }); return () => {} },
    },
  }
  await client.apply(ctx)
  assert.equal(calls[0].kind, 'mount')
  assert.equal(registrations.length, 1)
  const entry = registrations[0]
  assert.equal(entry.options.name, 'conversation.chat.turnTail')
  assert.equal(entry.options.id, 'turn-continuation')
  assert.equal(entry.options.select, undefined)
  await entry.options.inject('session-1').continueTurn()
  assert.deepEqual(calls[1], { kind: 'continue', request: { sessionId: 'session-1' } })
  const bundle = await readFile(clientBundleFile, 'utf8')
  assert.match(bundle, /remote\.turnContinuation/)
  assert.match(bundle, /Turn continuation Remote did not mount/)
  assert.match(bundle, /reason === "interrupted" \|\| reason === "error"/)
  assert.doesNotMatch(bundle, /session\.prompt/)
})
