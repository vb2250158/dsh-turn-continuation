window.__ModuleLoader__.load({
  id: "dsh-turn-continuation",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/TurnContinuation.tsx
var React = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
function isInterruptedTurn({ turn }) {
  const reason = turn.end?.data.reason.kind;
  return turn.status === "closed" && (reason === "interrupted" || reason === "error");
}
function TurnContinuation(props) {
  const running = props.useSession((snapshot) => snapshot.running);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);
  if (!isInterruptedTurn(props)) return null;
  const continueTurn = async () => {
    setBusy(true);
    setError(null);
    try {
      await props.continueTurn();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { "data-dsh-private-ui": "turn-continuation", style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" } }, /* @__PURE__ */ React.createElement(
    import_dsh_client_ui_primitives.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      disabled: running || busy,
      onClick: () => {
        void continueTurn();
      }
    },
    busy ? "\u6B63\u5728\u7EE7\u7EED\u2026" : "\u7EE7\u7EED\u91CD\u8BD5"
  ), running && /* @__PURE__ */ React.createElement("span", { role: "status", style: { color: "var(--dsw-alias-label-tertiary)", fontSize: "12px" } }, "Agent \u6B63\u5728\u8FD0\u884C"), error !== null && /* @__PURE__ */ React.createElement("span", { role: "alert", style: { color: "var(--dsw-alias-state-error-primary)", fontSize: "12px" } }, "\u7EE7\u7EED\u5931\u8D25\uFF1A", error));
}

// src/client/index.ts
var requestSchema = {
  parse(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Turn continuation request is invalid.");
    const request = value;
    if (typeof request.sessionId !== "string" || request.sessionId === "") throw new TypeError("Turn continuation session id is invalid.");
    return { sessionId: request.sessionId };
  }
};
var resultSchema = {
  parse(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value) || value.accepted !== true) {
      throw new TypeError("Turn continuation result is invalid.");
    }
    return { accepted: true };
  }
};
var turnContinuationRemote = {
  package: "dsh-turn-continuation",
  descriptors: [{
    id: "dsh-turn-continuation#turnContinuation/continue",
    service: "turnContinuation",
    namespace: "turnContinuation",
    method: "continue",
    invocation: { kind: "direct" },
    parameters: [{
      name: "request",
      wire: "request",
      source: "json",
      codec: { mode: "strict", typeSymbol: "dsh-turn-continuation#TurnContinuationRequest", create: () => requestSchema }
    }],
    result: { mode: "strict", typeSymbol: "dsh-turn-continuation#TurnContinuationResult", create: () => resultSchema }
  }]
};
var inject = ["slots", "remote"];
function continuationFor(service, sessionId) {
  return async () => {
    if (service.continue === void 0) throw new Error("\u7EE7\u7EED\u670D\u52A1\u5C1A\u672A\u5C31\u7EEA\u3002");
    const result = await service.continue({ sessionId });
    if (!result.ok || result.value === void 0) throw new Error(result.error?.message ?? "\u7EE7\u7EED\u5931\u8D25\u3002");
  };
}
async function apply(ctx) {
  const dispose = await ctx.remote.$mount(turnContinuationRemote);
  const service = ctx.reflect.get("remote.turnContinuation");
  if (service?.continue === void 0) throw new Error("Turn continuation Remote did not mount.");
  ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
    name: "conversation.chat.turnTail",
    id: "turn-continuation",
    priority: 20,
    inject: (sessionId) => ({ continueTurn: continuationFor(service, sessionId) })
  }, TurnContinuation));
  return dispose;
}

    return module.exports
  },
})
