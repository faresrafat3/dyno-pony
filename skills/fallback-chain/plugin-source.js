// fallback-chain v1.3 — DSH dynamic Cordis Plugin (host-only)
//
// One route: provider "chain", model "big-goal". Walking an ordered chain of
// provider/model entries read from /home/fares/.dsh/fallback-chain.yaml
// (re-read on EVERY request — edits apply on the next call, no restart).
// Per-entry circuit breaker: short cooldown after consecutive failures, long
// cooldown when the failure looks like quota/credit exhaustion.
//
// Failover rule: an entry is only skipped when it fails BEFORE the first
// chunk is forwarded. Once content streamed, a failure is forwarded as-is
// (a restart would duplicate already-committed output).
//
// Verified against the running runtime (0.1.3-alpha.2, 2026-09-08):
//   llm.stream(options: GenerateOptions) -> AsyncIterable<StreamChunk>
//   finish reasons: stop | tool-calls | max-tokens | aborted{failure} | error{failure}
//   llm-retry acts on agent/request-error (loop level) — it never re-runs a
//   stream mid-flight, so no double-failover interaction exists.
//   `harness` is a Builtin (not a service): never list it in inject.
//   Tool registration: harness.registerTool(ctx, harness.defineTool(def)).

const CHAIN_PATH = '/home/fares/.dsh/fallback-chain.yaml';
const STATE_PATH = '/home/fares/.dsh/fallback-chain-state.json';
const ROUTE = 'chain';
const MODEL = 'big-goal';

function stripTrailingComment(v) {
  const s = String(v);
  const at = s.indexOf(' #');
  return at === -1 ? s : s.slice(0, at);
}

function unquote(v) {
  const s = stripTrailingComment(v).trim();
  if ((s.startsWith('"') && s.endsWith('"') && s.length >= 2)
    || (s.startsWith("'") && s.endsWith("'") && s.length >= 2)) return s.slice(1, -1);
  return s;
}

// Minimal YAML subset: top-level `key: value` scalars + one `entries:` list of
// `- key: value` items. Full-line and ` #`-trailing comments both supported.
// Anything else fails loud with the line number.
function parseChain(text) {
  const settings = { cooldownMinutes: 10, quotaCooldownMinutes: 360, errorStreakThreshold: 2 };
  const entries = [];
  let inEntries = false;
  let current = null;
  function assignPair(obj, pair, no) {
    const m = pair.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
    if (!m) throw new Error('fallback-chain: line ' + no + ' is not a key: value pair: ' + pair);
    obj[m[1]] = unquote(m[2]);
  }
  String(text).split(/\r?\n/).forEach((raw, i) => {
    const no = i + 1;
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    const indent = raw.length - raw.trimStart().length;
    if (indent === 0) {
      if (stripTrailingComment(line) === 'entries:') { inEntries = true; current = null; return; }
      const m = stripTrailingComment(line).match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
      if (!m || !(m[1] in settings)) {
        throw new Error('fallback-chain: line ' + no + ' not understood (known settings: cooldownMinutes, quotaCooldownMinutes, errorStreakThreshold, entries): ' + line);
      }
      const num = Number(unquote(m[2]));
      if (!Number.isFinite(num) || num <= 0) throw new Error('fallback-chain: line ' + no + ': ' + m[1] + ' must be a positive number');
      settings[m[1]] = num;
      return;
    }
    if (!inEntries) throw new Error('fallback-chain: line ' + no + ' is indented outside "entries:": ' + line);
    if (line.startsWith('- ')) { current = {}; entries.push(current); assignPair(current, line.slice(2), no); return; }
    if (line.startsWith('-')) { current = {}; entries.push(current); return; }
    if (!current) throw new Error('fallback-chain: line ' + no + ' continues no entry: ' + line);
    assignPair(current, line, no);
  });
  if (!entries.length) throw new Error('fallback-chain: "entries:" list is empty in ' + CHAIN_PATH);
  entries.forEach((e, idx) => {
    if (!e.provider || !e.model) throw new Error('fallback-chain: entry #' + (idx + 1) + ' needs both provider and model');
    if (e.provider === ROUTE) throw new Error('fallback-chain: entry #' + (idx + 1) + ' must not reference the chain route itself (recursion)');
    if (e.contextWindow !== undefined) {
      const n = Number(e.contextWindow);
      if (!Number.isFinite(n) || n <= 0) throw new Error('fallback-chain: entry #' + (idx + 1) + ' contextWindow must be a positive number');
      e.contextWindow = n;
    }
  });
  return { settings, entries };
}

function messageOf(err) {
  if (err && err.message) return String(err.message).slice(0, 300);
  return String(err).slice(0, 300);
}

function isQuotaFailure(failure) {
  if (!failure) return false;
  if (failure.status === 402 || failure.status === 429) return true;
  const hay = ((failure.code || '') + ' ' + (failure.message || '')).toLowerCase();
  return /quota|credit|balance|insufficient|rate.?limit|payment|exhaust/.test(hay);
}

function looksQuotaText(text) {
  return /quota|credit|balance|insufficient|rate.?limit|payment|exhaust|402|429/i.test(String(text || ''));
}

return {
  inject: ['llm', 'fs'],
  async apply(ctx) {
    const llm = ctx.llm;
    const fs = ctx.fs;
    if (!llm || !fs) throw new Error('fallback-chain: the llm and fs services are required');

    const state = { entries: {} };
    try {
      const parsed = JSON.parse(await fs.readText(await fs.resolve(STATE_PATH)));
      if (parsed && typeof parsed === 'object' && parsed.entries && typeof parsed.entries === 'object') {
        state.entries = parsed.entries;
      }
    } catch (_) { /* first run or unreadable state: start fresh */ }

    async function saveState() {
      try { await fs.writeText(await fs.resolve(STATE_PATH), JSON.stringify(state)); }
      catch (err) { console.error('[fallback-chain] state save failed:', err && err.message); }
    }

    // Chain file is the live source of truth: re-read on every request.
    async function loadChain() {
      const text = await fs.readText(await fs.resolve(CHAIN_PATH));
      return parseChain(text);
    }

    function entryState(entry) {
      const key = entry.provider + '|' + entry.model;
      return state.entries[key] || (state.entries[key] = {
        consecutiveErrors: 0, totalCalls: 0, totalErrors: 0,
        lastError: null, lastErrorAt: 0, lastSuccessAt: 0, cooldownUntil: 0,
      });
    }

    function recordFailure(chain, entry, message, quota, now) {
      const s = entryState(entry);
      s.totalCalls++; s.totalErrors++; s.consecutiveErrors++;
      s.lastError = message; s.lastErrorAt = now;
      if (s.consecutiveErrors >= chain.settings.errorStreakThreshold) {
        const minutes = quota ? chain.settings.quotaCooldownMinutes : chain.settings.cooldownMinutes;
        s.cooldownUntil = now + minutes * 60000;
        s.consecutiveErrors = 0;
      }
    }

    function recordSuccess(entry, now) {
      const s = entryState(entry);
      s.totalCalls++; s.consecutiveErrors = 0; s.lastSuccessAt = now; s.lastError = null;
    }

    function redirect(options, entry) {
      const next = { ...options, provider: entry.provider, model: entry.model };
      if (entry.reasoningEffort) next.reasoningEffort = entry.reasoningEffort;
      return next;
    }

    function providerFailure(message, code) {
      return { type: 'finish', reason: { kind: 'error', failure: { message, code: code || 'PROVIDER_ERROR' } } };
    }

    function isMissingFinishError(err) {
      return /LLM stream ended without a terminal finish chunk/.test(messageOf(err));
    }

    async function* chainStream(options) {
      const chain = await loadChain();
      let lastError = null;
      for (const entry of chain.entries) {
        const s = entryState(entry);
        if (s.cooldownUntil && s.cooldownUntil > Date.now()) continue;
        let committed = false;
        let terminal = null;
        let thrown = null;
        const redirected = redirect(options, entry);
        let iterator;
        try {
          iterator = llm.stream(redirected)[Symbol.asyncIterator]();
        } catch (err) { thrown = err; }
        let completed = false;
        if (iterator) {
          try {
            while (true) {
              let next;
              try {
                next = await iterator.next();
              } catch (err) {
                thrown = err;
                break;
              }
              if (next.done) { completed = true; break; }
              const chunk = next.value;
              if (chunk.type === 'finish') { terminal = chunk; completed = true; break; }
              committed = true;
              yield chunk;
            }
          } finally {
            if (!completed) {
              const close = iterator.return && iterator.return.bind(iterator);
              if (close) await close();
            }
          }
        }
        if (thrown !== null) {
          if (!isMissingFinishError(thrown)) throw thrown;
          const text = messageOf(thrown);
          recordFailure(chain, entry, text, looksQuotaText(text), Date.now());
          await saveState();
          if (committed) {
            yield providerFailure(text, 'STREAM_CLOSED');
            return;
          }
          lastError = thrown instanceof Error ? thrown : new Error('fallback-chain[' + entry.provider + '/' + entry.model + ']: ' + text);
          continue;
        }
        if (terminal === null) {
          const text = 'stream ended without a finish chunk';
          recordFailure(chain, entry, text, false, Date.now());
          await saveState();
          if (committed) {
            yield providerFailure(text, 'STREAM_CLOSED');
            return;
          }
          lastError = new Error('fallback-chain[' + entry.provider + '/' + entry.model + ']: ' + text);
          continue;
        }
        const kind = terminal.reason && terminal.reason.kind;
        if (kind === 'error') {
          const failure = terminal.reason.failure;
          const text = (failure && failure.message) || 'unknown error';
          recordFailure(chain, entry, text, isQuotaFailure(failure), Date.now());
          await saveState();
          if (!committed) {
            lastError = new Error('fallback-chain[' + entry.provider + '/' + entry.model + ']: ' + text);
            continue;
          }
          yield { type: 'finish', reason: terminal.reason };
          return;
        }
        if (kind === 'aborted') {
          // The consumer cancelled: never failover, never blame the entry.
          await saveState();
          yield { type: 'finish', reason: terminal.reason };
          return;
        }
        recordSuccess(entry, Date.now());
        await saveState();
        // replayState stripped: a chain response records the chain route, so it
        // is not replayable — the next request re-enters the chain normally.
        yield { type: 'finish', reason: terminal.reason };
        return;
      }
      if (lastError) throw lastError;
      throw new Error('fallback-chain: every entry is cooling down or the list is empty — edit ' + CHAIN_PATH + ' (applies next request) or run chain_status reset');
    }

    const adapter = {
      providerInfo(provider) { return { id: provider, name: 'Fallback Chain' }; },
      providerRetryPolicy() { return undefined; },
      async listModels(provider) {
        const chain = await loadChain();
        return [{
          provider,
          id: MODEL,
          name: 'Fallback chain (' + chain.entries.length + ' routes)',
          description: 'Walks the ordered chain in ~/.dsh/fallback-chain.yaml',
        }];
      },
      async resolveModel(provider, model) {
        return { provider, id: model, name: model };
      },
      async prepareCall(provider, model) {
        const info = await this.resolveModel(provider, model);
        return { model: info, stream: (options) => chainStream(options) };
      },
      stream: (options) => chainStream(options),
    };

    // Fail loud on a malformed chain file at mount; warn (not fail) on entries
    // whose provider route is not currently registered — free routes come and go.
    const chain = await loadChain();
    let listed;
    try { listed = await Promise.resolve(llm.listProviders()) || []; }
    catch (_) { listed = []; }
    const live = new Set(listed.map((p) => p.id));
    const unknown = chain.entries.filter((e) => !live.has(e.provider));
    for (const e of unknown) {
      console.warn('[fallback-chain] entry ' + e.provider + '/' + e.model + ' names a provider that is not registered right now — it will be skipped at request time');
    }

    const handle = llm.registerAdapter([ROUTE], adapter);
    ctx.effect(() => () => handle());

    // `harness` is a builtin, not a service. Registration must wrap the
    // definition in defineTool first, then registerTool owns the lifecycle.
    if (harness && harness.defineTool && harness.registerTool) {
      const statusAction = async (args) => {
        const action = (args && args.action) || 'status';
        let current;
        try { current = await loadChain(); }
        catch (err) { return { action, error: messageOf(err) }; }
        if (action === 'reset') {
          let cleared = 0;
          for (const key of Object.keys(state.entries)) {
            const s = state.entries[key];
            if (s.cooldownUntil || s.consecutiveErrors || s.lastError) cleared++;
            s.cooldownUntil = 0; s.consecutiveErrors = 0; s.lastError = null;
          }
          await saveState();
          return { action, cleared, message: 'Cooldowns and error streaks cleared (' + cleared + ' entries had state)' };
        }
        const now = Date.now();
        const rows = current.entries.map((e, idx) => {
          const s = entryState(e);
          const cooling = s.cooldownUntil && s.cooldownUntil > now;
          return {
            order: idx + 1,
            provider: e.provider,
            model: e.model,
            live: live.has(e.provider),
            status: cooling ? 'cooldown ' + Math.ceil((s.cooldownUntil - now) / 60000) + 'm left' : 'ready',
            consecutiveErrors: s.consecutiveErrors || 0,
            totalCalls: s.totalCalls || 0,
            totalErrors: s.totalErrors || 0,
            lastError: s.lastError || null,
            minutesSinceSuccess: s.lastSuccessAt ? Math.round((now - s.lastSuccessAt) / 60000) : null,
          };
        });
        return {
          action,
          route: ROUTE + '/' + MODEL,
          entries: rows,
          message: 'Pick provider "' + ROUTE + '" model "' + MODEL + '" in /model for goal sessions; entries are tried top to bottom.',
        };
      };
      const disposeTool = harness.registerTool(ctx, harness.defineTool({
        name: 'chain_status',
        description: 'Inspect the fallback chain route ("chain"/"big-goal"): ordered entries with live/cooldown state and per-entry stats. Actions: status (default) or reset (clear cooldowns).',
        parameters: {
          action: { type: 'string', enum: ['status', 'reset'], description: 'Action to perform', required: true },
        },
        output: {
          schema: {
            type: 'object', additionalProperties: true,
            properties: {
              action: { type: 'string' }, route: { type: 'string' },
              entries: { type: 'array', items: { type: 'object', additionalProperties: true } },
              cleared: { type: 'number' }, error: { type: 'string' }, message: { type: 'string' },
            },
          },
          render(_args, result) {
            if (!result) return [{ type: 'text', text: 'no result' }];
            const lines = [];
            if (result.error) lines.push({ type: 'text', text: 'ERROR: ' + result.error });
            if (result.message) lines.push({ type: 'text', text: result.message });
            if (result.entries) {
              for (const e of result.entries) {
                lines.push({
                  type: 'text',
                  text: '  #' + e.order + ' ' + e.provider + '/' + e.model
                    + ' | ' + e.status
                    + ' | route=' + (e.live ? 'live' : 'NOT-REGISTERED')
                    + ' | calls=' + e.totalCalls + ' err=' + e.totalErrors
                    + (e.lastError ? ' | lastErr=' + String(e.lastError).slice(0, 120) : ''),
                });
              }
            }
            if (lines.length === 0) lines.push({ type: 'text', text: JSON.stringify(result, null, 2) });
            return lines;
          },
        },
        execute(args) { return statusAction(args); },
      }));
      if (typeof disposeTool === 'function') ctx.effect(() => () => disposeTool());
    } else {
      console.warn('[fallback-chain] harness tool builtins unavailable; chain_status tool not mounted (route still active)');
    }

    console.log('[fallback-chain] mounted ' + ROUTE + '/' + MODEL
      + ' with ' + chain.entries.length + ' entries ('
      + chain.entries.map((e) => e.provider).join(' → ')
      + '); file=' + CHAIN_PATH);
  },
};
