import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import * as React from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'

/** Callback injected at session scope to continue through the public Session prompt API. */
export interface TurnContinuationInjected {
  /** Start one fresh continuation turn from the durable conversation context. */
  continueTurn: () => Promise<void>
}

/** Turn-tail slot props plus the continuation operation. */
export type TurnContinuationProps = PropsRuntime<'conversation.chat.turnTail'>
  & InjectFace<TurnContinuationInjected>

function isInterruptedTurn({ turn }: Pick<TurnContinuationProps, 'turn'>): boolean {
  const reason = turn.end?.data.reason.kind
  return turn.status === 'closed' && (reason === 'interrupted' || reason === 'error')
}

/** Claim only terminal turns that can safely start a new continuation turn. */
export function selectInterruptedTurn(owner: Pick<TurnContinuationProps, 'turn'>): true | null {
  return isInterruptedTurn(owner) ? true : null
}

/** Render an explicit recovery action only below a crash-interrupted turn. */
export function TurnContinuation(props: TurnContinuationProps) {
  const running = props.useSession(snapshot => snapshot.running)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (!isInterruptedTurn(props)) return null

  const continueTurn = async (): Promise<void> => {
    setBusy(true)
    setError(null)
    try {
      await props.continueTurn()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div data-dsh-private-ui="turn-continuation" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={running || busy}
        onClick={() => { void continueTurn() }}
      >
        {busy ? '正在继续…' : '继续重试'}
      </Button>
      {running && <span role="status" style={{ color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' }}>Agent 正在运行</span>}
      {error !== null && <span role="alert" style={{ color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' }}>继续失败：{error}</span>}
    </div>
  )
}
