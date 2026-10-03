import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TYPERT } from '../lib/typert.host.js'

test('old and new Typert readers accept the same request and reject missing session IDs', () => {
  const invocation = TYPERT.invocations[0]
  const request = invocation.parameters[0].codec
  for (const schema of [request.schema, request.create()]) {
    assert.equal(schema.safeParse({ sessionId: 'session' }).success, true)
    assert.equal(schema.safeParse({ sessionId: '' }).success, false)
    assert.equal(schema.safeParse({}).success, false)
  }
  for (const schema of [invocation.result.schema, invocation.result.create()]) {
    assert.equal(schema.safeParse({ accepted: true }).success, true)
    assert.equal(schema.safeParse({ accepted: false }).success, false)
  }
})
