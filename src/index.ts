declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap {
    'plugin:turn-continuation': { readonly kind: 'plugin:turn-continuation'; readonly form: 'notice'; readonly summary: string }
  }
}

/** Host half of the direct interrupted-turn continuation action. */

import type {} from '@deepseek-ai/dsh-agent'
import { MessageId } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import type { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const PLUGIN_NAME = 'turn-continuation'
const CONTINUATION_TEXT = 'Continue the unfinished previous task from the saved context. Inspect the preceding partial response and completed tool results first. Do not repeat completed work; continue with the next useful step.'
const CONTINUATION_SUMMARY = '继续未完成任务'

/** Request accepted by the direct browser recovery action. */
export interface TurnContinuationRequest {
  sessionId: string
}

/** Direct recovery admission receipt. */
export interface TurnContinuationResult {
  accepted: true
}

interface ContinuationProtocol {
  TypertRemoteService: typeof TypertRemoteService
  Remote: typeof Remote
}

function createTurnContinuationService(protocol: ContinuationProtocol) {
  const initializers: Array<(this: TurnContinuationService) => void> = []

  class TurnContinuationService extends protocol.TypertRemoteService {
    constructor(ctx: Context) {
      super(ctx, 'turnContinuation')
      for (const initialize of initializers) initialize.call(this)
    }

    /** Queue a plugin-origin continuation so the browser adds no user-message bubble. */
    async continue(request: TurnContinuationRequest): Promise<TurnContinuationResult> {
      const agent = this.ctx.agents.get(SessionId(request.sessionId))
      if (agent === undefined) throw new Error('当前会话已不可用。')
      if (agent.status !== 'idle') throw new Error('Agent 正在运行。')
      agent.followup({
        id: MessageId(crypto.randomUUID()),
        role: 'user',
        content: [{ type: 'text', text: CONTINUATION_TEXT }],
        source: { kind: `plugin:${PLUGIN_NAME}`, form: 'notice', summary: CONTINUATION_SUMMARY },
      })
      return { accepted: true }
    }
  }

  protocol.Remote('continue')(TurnContinuationService.prototype.continue, {
    kind: 'method', access: { has: (value: TurnContinuationService) => 'continue' in value, get: (value: TurnContinuationService) => value.continue }, metadata: {},
    private: false,
    static: false,
    name: 'continue',
    addInitializer(initializer) { initializers.push(initializer) },
  })
  return TurnContinuationService
}

const LocalTurnContinuationService = createTurnContinuationService({ TypertRemoteService, Remote })
let profileTurnContinuationService: typeof LocalTurnContinuationService | undefined

function createProfileTurnContinuationService(): typeof LocalTurnContinuationService {
  if (profileTurnContinuationService !== undefined) return profileTurnContinuationService
  try {
    const dshHome = resolve(process.env.DSH_HOME?.trim() || join(homedir(), '.dsh'))
    const profileRequire = createRequire(join(dshHome, 'profiles', 'web', 'package.json'))
    const protocol = profileRequire('@deepseek-ai/dsh-typert-protocol') as Partial<ContinuationProtocol>
    if (typeof protocol.TypertRemoteService === 'function' && typeof protocol.Remote === 'function') {
      profileTurnContinuationService = createTurnContinuationService(protocol as ContinuationProtocol)
      return profileTurnContinuationService
    }
  } catch {
    // Standalone tests use the linked package's protocol instance.
  }
  profileTurnContinuationService = LocalTurnContinuationService
  return profileTurnContinuationService
}

/** Register the host-side direct continuation operation. */
export function apply(ctx: Context): void {
  ctx.inject(['agents'], (agentCtx) => {
    const TurnContinuationService = createProfileTurnContinuationService()
    new TurnContinuationService(agentCtx)
  })
}
