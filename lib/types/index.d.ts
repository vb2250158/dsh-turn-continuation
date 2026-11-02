declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        'plugin:turn-continuation': {
            readonly kind: 'plugin:turn-continuation';
            readonly form: 'notice';
            readonly summary: string;
        };
    }
}
import type { Context } from '@deepseek-ai/cordis';
/** Request accepted by the direct browser recovery action. */
export interface TurnContinuationRequest {
    sessionId: string;
}
/** Direct recovery admission receipt. */
export interface TurnContinuationResult {
    accepted: true;
}
/** Register the host-side direct continuation operation. */
export declare function apply(ctx: Context): void;
