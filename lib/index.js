// src/index.ts
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
var PLUGIN_NAME = "turn-continuation";
var CONTINUATION_TEXT = "Continue the unfinished previous task from the saved context. Inspect the preceding partial response and completed tool results first. Do not repeat completed work; continue with the next useful step.";
var CONTINUATION_SUMMARY = "\u7EE7\u7EED\u672A\u5B8C\u6210\u4EFB\u52A1";
function createTurnContinuationService(protocol) {
  const initializers = [];
  class TurnContinuationService extends protocol.TypertRemoteService {
    constructor(ctx) {
      super(ctx, "turnContinuation");
      for (const initialize of initializers) initialize.call(this);
    }
    /** Queue a plugin-origin continuation so the browser adds no user-message bubble. */
    async continue(request) {
      const agent = this.ctx.agents.get(request.sessionId);
      if (agent === void 0) throw new Error("\u5F53\u524D\u4F1A\u8BDD\u5DF2\u4E0D\u53EF\u7528\u3002");
      if (agent.status !== "idle") throw new Error("Agent \u6B63\u5728\u8FD0\u884C\u3002");
      agent.followup({
        id: crypto.randomUUID(),
        role: "user",
        content: [{ type: "text", text: CONTINUATION_TEXT }],
        source: { kind: "plugin", plugin: PLUGIN_NAME, form: "notice", summary: CONTINUATION_SUMMARY }
      });
      return { accepted: true };
    }
  }
  protocol.Remote("continue")(TurnContinuationService.prototype.continue, {
    private: false,
    static: false,
    name: "continue",
    addInitializer(initializer) {
      initializers.push(initializer);
    }
  });
  return TurnContinuationService;
}
var LocalTurnContinuationService = createTurnContinuationService({ TypertRemoteService, Remote });
var profileTurnContinuationService;
function createProfileTurnContinuationService() {
  if (profileTurnContinuationService !== void 0) return profileTurnContinuationService;
  try {
    const dshHome = resolve(process.env.DSH_HOME?.trim() || join(homedir(), ".dsh"));
    const profileRequire = createRequire(join(dshHome, "profiles", "web", "package.json"));
    const protocol = profileRequire("@deepseek-ai/dsh-typert-protocol");
    if (typeof protocol.TypertRemoteService === "function" && typeof protocol.Remote === "function") {
      profileTurnContinuationService = createTurnContinuationService(protocol);
      return profileTurnContinuationService;
    }
  } catch {
  }
  profileTurnContinuationService = LocalTurnContinuationService;
  return profileTurnContinuationService;
}
function apply(ctx) {
  ctx.inject(["agents"], (agentCtx) => {
    const TurnContinuationService = createProfileTurnContinuationService();
    new TurnContinuationService(agentCtx);
  });
}
export {
  apply
};
