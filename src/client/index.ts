/** Browser half of the interrupted-turn continuation action. */

import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { TurnContinuation, type TurnContinuationInjected } from './TurnContinuation.tsx'

interface TurnContinuationResult {
  accepted: true
}

const requestSchema = {
  parse(value: unknown): { sessionId: string } {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Turn continuation request is invalid.')
    const request = value as { sessionId?: unknown }
    if (typeof request.sessionId !== 'string' || request.sessionId === '') throw new TypeError('Turn continuation session id is invalid.')
    return { sessionId: request.sessionId }
  },
}

const resultSchema = {
  parse(value: unknown): TurnContinuationResult {
    if (value === null || typeof value !== 'object' || Array.isArray(value) || (value as { accepted?: unknown }).accepted !== true) {
      throw new TypeError('Turn continuation result is invalid.')
    }
    return { accepted: true }
  },
}

const turnContinuationRemote = {
  package: 'dsh-turn-continuation',
  descriptors: [{
    id: 'dsh-turn-continuation#turnContinuation/continue',
    service: 'turnContinuation',
    namespace: 'turnContinuation',
    method: 'continue',
    invocation: { kind: 'direct' as const },
    parameters: [{
      name: 'request', wire: 'request', source: 'json' as const,
      codec: { mode: 'strict' as const, typeSymbol: 'dsh-turn-continuation#TurnContinuationRequest', schema: requestSchema },
    }],
    result: { mode: 'strict' as const, typeSymbol: 'dsh-turn-continuation#TurnContinuationResult', schema: resultSchema },
  }],
}

/** Browser services required by this client-only slot contribution. */
export const inject = ['slots', 'remote']

function continuationFor(
  service: { continue?: (request: { sessionId: SessionId }) => Promise<{ ok?: boolean, value?: TurnContinuationResult, error?: { message?: string } }> },
  sessionId: SessionId,
): TurnContinuationInjected['continueTurn'] {
  return async () => {
    if (service.continue === undefined) throw new Error('继续服务尚未就绪。')
    const result = await service.continue({ sessionId })
    if (!result.ok || result.value === undefined) throw new Error(result.error?.message ?? '继续失败。')
  }
}

/** Register the direct recovery action under interrupted or terminal-error turns. */
export async function apply(ctx: ClientContext): Promise<() => Promise<void>> {
  const dispose = await ctx.remote.$mount(turnContinuationRemote)
  const service = ctx.reflect.get('remote.turnContinuation') as {
    continue?: (request: { sessionId: SessionId }) => Promise<{ ok?: boolean, value?: TurnContinuationResult, error?: { message?: string } }>
  } | undefined
  if (service?.continue === undefined) throw new Error('Turn continuation Remote did not mount.')
  ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
    name: 'conversation.chat.turnTail',
    priority: 20,
    select: ({ turn }) => {
      const reason = turn.end?.data.reason.kind
      return turn.status === 'closed' && (reason === 'interrupted' || reason === 'error') ? true : null
    },
    inject: (sessionId) => ({ continueTurn: continuationFor(service, sessionId) }),
  }, TurnContinuation))
  return dispose
}
