/* Generated-style Typert contribution for direct interrupted-turn continuation. */

import { z } from 'zod'

const Request = z.object({ sessionId: z.string().min(1) })
const Result = z.object({ accepted: z.literal(true) })

export const TYPERT = {
  package: 'dsh-turn-continuation',
  face: 'host',
  schemas: [],
  model: { services: [], events: [], objects: [] },
  invocations: [
    {
      id: 'dsh-turn-continuation#turnContinuation/continue',
      service: 'turnContinuation',
      namespace: 'turnContinuation',
      method: 'continue',
      invocation: { kind: 'direct' },
      parameters: [{
        name: 'request',
        wire: 'request',
        source: 'json',
        codec: { mode: 'strict', typeSymbol: 'dsh-turn-continuation#TurnContinuationRequest', create: () => ( Request) },
      }],
      result: { mode: 'strict', typeSymbol: 'dsh-turn-continuation#TurnContinuationResult', create: () => ( Result) },
      sourceLocation: { file: 'plugins/client-ui-turn-continuation/src/index.ts', line: 38, column: 11 },
    },
  ],
}
