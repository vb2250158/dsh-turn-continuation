/** Browser half of the interrupted-turn continuation action. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
/** Browser services required by this client-only slot contribution. */
export declare const inject: string[];
/** Register the direct recovery action under interrupted or terminal-error turns. */
export declare function apply(ctx: ClientContext): Promise<() => Promise<void>>;
