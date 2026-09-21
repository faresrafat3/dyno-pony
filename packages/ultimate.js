// Source-of-truth for the ultimate dynamic plugin (v1).
//
// One composite tool that flips the session into "ultimate mode" —
// Fares's opt-in phrase for "go all out, use the entire arsenal".
//
// Re-apply with: cordis_define plugin kind=existing pluginId=ult-1 ...
//
// Shape: manifest (1 tool, 3 actions) + persona overlay.
// What it does NOT do: it does NOT call cordis_run on 13 pluginIds. The
// dyno-pony merged plugin is already loaded and registers the whole arsenal.
// The merge is upstream of this skill. The tool count this skill reports is
// read back from the live registry at call time (E6: counters are derived,
// never hardcoded), never from a literal or from the length of the list
// below. This skill's job is to:
//   1. Set a session flag (s.ultimate.armed = true / false)
//   2. Return a persona overlay prompt the model reads silently
//   3. List what is "armed" so the model and Fares can introspect
// Disarm with: "stop ultimate", "exit ultimate", "normal mode", or
// ultimate(action="off").

return {
  apply(ctx) {
    const POOL_KEY = 'ultimate.callCount';
    const ARM_KEY  = 'ultimate.armed';
    const AT_KEY   = 'ultimate.armedAt';
    const session  = ctx.get('sessions');
    if (session && typeof session.current === 'function' && session.current()) {
      const s = session.current();
      if (s && s[ARM_KEY] === undefined) s[ARM_KEY] = false;
      if (s && !s[POOL_KEY]) s[POOL_KEY] = 0;
    }

    const note = function (text) {
      const s = session && session.current && session.current();
      if (s) s[POOL_KEY] = (s[POOL_KEY] || 0) + 1;
      return text;
    };

    // The full arsenal — matches packages/dyno-pony.js merged plugin.
    // Listed here so the model can see what "everything" means when Fares
    // asks for ultimate mode. No file I/O; pure declarative list.
    const ARSENAL = {
      'ponytail':      { preset: 'pony-mode',     role: 'lazy senior dev (YAGNI ladder, 6 actions)' },
      'caveman':       { preset: 'caveman-mode',  role: 'terse prose (4 actions)' },
      'orch_route':    { preset: 'pony-mode',     role: 'pick the best mode for one task' },
      'orch_compare':  { preset: 'pony-mode',     role: 'run same task under 4 modes side-by-side' },
      'orch_pipeline': { preset: 'pony-mode',     role: 'chain modes turn by turn' },
      'orch_status':   { preset: 'pony-mode',     role: 'introspect which modes are active' },
      'sphinx':        { preset: 'sentinel-mode', role: 'context budget governor (audit/checkpoint/predict)' },
      'drift':         { preset: 'sentinel-mode', role: 'live loop/contradiction detector (loop/contradict/silent)' },
      'second_order':  { preset: 'sentinel-mode', role: 'think one step past the change (trace/blast/gate)' },
      // this tool itself — declared so the list IS the whole bundle, and so the
      // registry cross-check in tests/preflight.test.cjs has nothing to exclude
      'ultimate':      { preset: 'ultimate-mode', role: 'arm/disarm this overlay itself (on/off/status)' },
      'dsh_author_inspect':  { preset: 'standalone', role: '4-step recipe to inspect a dynamic plugin' },
      'dsh_author_define':   { preset: 'standalone', role: 'cordis_define parameter template' },
      'dsh_author_run':      { preset: 'standalone', role: 'cordis_run pattern' },
      'dsh_author_validate': { preset: 'standalone', role: 'catches the 6 most common authoring mistakes' },
      'dsh_author_recover':  { preset: 'standalone', role: 'rebuild commands for an existing pluginId' },
      'memo_classify': { preset: 'standalone', role: 'pick the right Agent Note tier' },
      'memo_format':   { preset: 'standalone', role: 'note file template' },
      'memo_link':     { preset: 'standalone', role: 'lint relative-Markdown cross-references' },
      'memo_scope':    { preset: 'standalone', role: 'supersession check against the active tree' },
      'memo_archive':  { preset: 'standalone', role: 'archive triplet (.md + .zh.md + .i18n.yaml)' },
      'memo_review':   { preset: 'standalone', role: 'one-pass prose-standard review' },
      'ptest_template':  { preset: 'standalone', role: 'emit a Vitest spec body' },
      'ptest_assertions':{ preset: 'standalone', role: '4 standard + 3 optional assertions' },
      'ptest_harness':   { preset: 'standalone', role: 'fake-ctx.ts source for mounting in Vitest' },
      'cdx_map':      { preset: 'standalone', role: 'plan a directory tree walk' },
      'cdx_symbols':  { preset: 'standalone', role: 'top-level exported symbols for a file' },
      'cdx_imports':  { preset: 'standalone', role: 'import graph edges for a file' },
      'cdx_owner':    { preset: 'standalone', role: 'DSH conventions for finding a file\'s owning package' },
      'cdx_diff':     { preset: 'standalone', role: 'plan a file-level git diff against a baseline' },
      'mem_write':    { preset: 'standalone', role: 'plan a write of a note at a scope' },
      'mem_read':     { preset: 'standalone', role: 'plan a read of k most recent notes' },
      'mem_search':   { preset: 'standalone', role: 'plan a keyword search over a scope' },
      'mem_promote':  { preset: 'standalone', role: 'plan a promotion of a note up the hierarchy' },
      'wf_compose':   { preset: 'standalone', role: 'convert an orch pipeline into a workflow script' },
      'wf_run':       { preset: 'standalone', role: 'plan a submit to ctx.workflowEngine.start' },
      'wf_collect':   { preset: 'standalone', role: 'wait for the run to settle' },
      'trc_mode_flow':{ preset: 'standalone', role: 'extract ordered dyno-pony tool invocations from logs' },
      'trc_diff':     { preset: 'standalone', role: 'side-by-side compare of two sessions\' mode flows' },
    };

    const arsenalList = Object.keys(ARSENAL).sort();

    // E6 — the tool count is READ FROM THE REGISTRY, never from a literal and
    // never from the length of the list above. A hardcoded 37 standing next to
    // a registry holding 38 is the lie this replaces (AGENT-ERGONOMICS.md P4):
    // two surfaces of the same system disagreeing teaches the agent to
    // distrust every count it is handed.
    //
    // `ctx.tools` is the sandbox's read-only registry façade (host-runner
    // guard.js: { register, schemas, get }), reachable without an `inject`
    // declaration. `schemas()` lists the tools visible to THIS package's scope,
    // which includes the host's own tools — so the measured number is the
    // intersection with the names declared above, not the raw array length.
    // That intersection is the true statement "how much of the arsenal is
    // actually available to you".
    const registryToolNames = function () {
      try {
        const registry = ctx && ctx.tools;
        if (!registry || typeof registry.schemas !== 'function') return null;
        const schemas = registry.schemas();
        if (!Array.isArray(schemas)) return null;
        return schemas
          .map(function (s) { return s && s.name; })
          .filter(function (n) { return typeof n === 'string'; });
      } catch (_e) {
        return null;
      }
    };

    // `confirmed` separates a MEASURED count from an unmeasured one. With no
    // registry reachable there is nothing to measure against, so the number
    // falls back to the declared list AND every surface that prints it says so.
    // A silent fallback would be the same lie in a smaller font.
    const arsenalState = function () {
      const live = registryToolNames();
      if (live === null) return { count: arsenalList.length, confirmed: false, missing: [] };
      const present = {};
      for (let i = 0; i < live.length; i++) present[live[i]] = true;
      const missing = arsenalList.filter(function (n) { return !present[n]; });
      return { count: arsenalList.length - missing.length, confirmed: true, missing: missing };
    };

    const arsenalLine = function (st) {
      if (!st.confirmed) {
        return 'Total tools in the arsenal: ' + st.count + ' (declared — no tools registry on this ctx).';
      }
      if (st.missing.length) {
        return 'Total tools in the arsenal: ' + st.count + ' of ' + arsenalList.length +
          ' registered — MISSING: ' + st.missing.join(', ') + '.';
      }
      return 'Total tools in the arsenal: ' + st.count + '.';
    };

    const availabilityLine = function (st) {
      if (!st.confirmed) {
        return 'The DSH arsenal is available (' + st.count + ' tools declared — no tools registry on this ctx to verify against).';
      }
      if (st.missing.length) {
        return st.count + ' of ' + arsenalList.length + ' arsenal tools are available — MISSING: ' + st.missing.join(', ') + '.';
      }
      return 'All ' + st.count + ' tools in the DSH arsenal are now available.';
    };

    const setArmed = function (val) {
      const s = session && session.current && session.current();
      if (s) {
        s[ARM_KEY] = !!val;
        if (val) s[AT_KEY] = Date.now();
      }
    };

    const isArmed = function () {
      const s = session && session.current && session.current();
      return !!(s && s[ARM_KEY]);
    };

    const ACTIONS = {
      on: function (reason) {
        setArmed(true);
        const why = reason ? ' Reason: ' + reason + '.' : '';
        return note([
          '# ULTIMATE MODE — ARMED',
          '',
          availabilityLine(arsenalState()),
          'You are running in the "go all out" persona.' + why,
          '',
          '## Persona overlay (read silently, do not narrate)',
          '',
          'You have every tool. Use them smartly:',
          '- **Lazy by default**: ponytail(mode=ultra) — YAGNI, reuse, stdlib first.',
          '- **Terse by default**: caveman(action=terse) — short replies, no preamble.',
          '- **Smart-route**: orch_route picks the mode for each task; do not micro-manage.',
          '- **Self-check**: sphinx fires on budget pressure, drift on linguistic fossils, second_order on hard-to-undo actions. Do not narrate these to the user.',
          '- **Save judgement**: memo_classify + memo_format for any decision worth keeping; mem_promote when a note proves reusable.',
          '- **Review before you build**: cdx_map / cdx_symbols / cdx_owner before touching a new repo.',
          '- **Subagents when it actually fans out**: workflow.wf_compose → wf_run → wf_collect; otherwise just do it.',
          '- **Post-hoc review**: trace.trc_mode_flow at the end of a session.',
          '',
          '## What you do NOT do',
          '',
          '- You do not narrate "ultimate mode is on" to the user. The flag is private.',
          '- You do not call cordis_run, cordis_stop, cordis_define, or cordis_undefine unless Fares asks — the arsenal is already mounted by the dyno-pony merged plugin.',
          '- You do not always-on nag. The sentinels (sphinx/drift/second_order) decide when to fire.',
          '',
          '## Trigger',
          '',
          'Fares said: "ultimate mode" (or "go all out" / "full arsenal" / "كل حاجة" / Arabic equivalents).',
          'Disarm with: "stop ultimate" / "exit ultimate" / "normal mode" / "ultimate off".',
          '',
          '## Introspect',
          '',
          'ultimate(action="status") returns the current flag and the arsenal list.',
        ].join('\n'));
      },

      off: function () {
        setArmed(false);
        const st = arsenalState();
        return note([
          '# ULTIMATE MODE — DISARMED',
          '',
          'Returned to baseline. The ' + st.count + ' dyno-pony tools are still registered' +
            (st.confirmed ? '' : ' (declared)') + ';',
          'this only flips the persona overlay off.',
          '',
          'Re-arm with: "ultimate mode" / "go all out" / "ultimate on".',
        ].join('\n'));
      },

      status: function () {
        const armed = isArmed();
        const st = arsenalState();
        return note([
          '# ULTIMATE MODE — STATUS',
          '',
          'Armed: ' + (armed ? '**YES**' : '**no**') + '.',
          arsenalLine(st),
          '',
          '## Arsenal',
          '',
          arsenalList.map(function (n) { return '- `' + n + '` — ' + ARSENAL[n].role; }).join('\n'),
          '',
          '## Toggle',
          '',
          'ultimate(action="on")  → arm + read the persona overlay',
          'ultimate(action="off") → disarm',
        ].join('\n'));
      },
    };

    const tool = {
      name: 'ultimate',
      description: 'Ultimate mode (وضع ultimate — كل حاجه شغالة). One tool: `ultimate` with 3 actions — `on` (arm the persona overlay: pony + caveman + sentinels + every dyno-pony tool, with smart routing), `off` (return to baseline), `status` (introspect the arsenal). Triggered when Fares says "ultimate mode" / "go all out" / "full arsenal" / "كل حاجة". Off with "stop ultimate" / "exit ultimate" / "normal mode". Does NOT mount new plugins — the dyno-pony merged bundle is already loaded. Sets a private session flag and returns a persona overlay prompt the model reads silently.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['on', 'off', 'status'], description: 'Which ultimate action to invoke.' },
          reason: { type: 'string', description: 'Optional one-line reason for arming (e.g. "long session, big refactor ahead").' },
        },
        required: ['action'],
      },
      output: {
        schema: { type: 'string' },
        render: function (_args, value) { return [{ type: 'text', text: String(value) }]; },
      },
      execute: async function (_args, params) {
        const a = (params && params.action) || (_args && _args.action);
        if (!a || typeof ACTIONS[a] !== 'function') {
          return 'Unknown action. Valid: on, off, status.';
        }
        return ACTIONS[a](params.reason || (_args && _args.reason));
      },
    };

    const dispose = harness.registerTool(ctx, harness.defineTool(tool));
    ctx.effect(function () { return dispose; }, 'ultimate:dispose-on-fork');
    // Read the count only AFTER registering, so this tool is part of the
    // measurement rather than an exception to it.
    const mounted = arsenalState();
    console.log('[ultimate] registered tool "ultimate" (actions: on, off, status). Arsenal: ' +
      mounted.count + ' tools' + (mounted.confirmed ? ' (registry-confirmed)' : ' (declared)') + '.');
  },
};
