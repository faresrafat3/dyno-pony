// preflight.test.cjs — the "is the system alive and are the docs true" oracle.
//
// Run with: node --test tests/preflight.test.cjs
//
// Born from two real failures (2026-09-18 session):
//   1. The skill docs prescribed `kind=existing pluginId=<pinned>` recovery
//      recipes whose IDs are dead after any DSH restart — every one of them
//      fails with `no dynamic plugin ... in this process`.
//   2. The documented harness.defineTool schema contract was INVERTED:
//      `parameters` requires a root `required` array (raw wrapper form) or
//      per-property `required: true` (direct DSL form) — never both; the docs
//      prescribed exactly the rejected shape. Cost: 3 failed cordis_run calls.
//
// Green here means: the bundle parses, defines exactly 38 tools, every tool
// schema passes the REAL host guard (sandboxDefineTool from
// @deepseek-ai/dsh-cordis-host-runner), and the canonical skill docs agree
// with disk reality. If this suite is red, do not ship and do not trust the
// docs — fix the red line first.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');
const MERGED = path.join(PACKAGES_DIR, 'dyno-pony.js');
const SKILLS_DIR = path.join(ROOT, 'dynamic-skills');

const EXPECTED_TOOLS = [
  'ponytail', 'caveman',
  'orch_route', 'orch_compare', 'orch_pipeline', 'orch_status',
  'dsh_author_inspect', 'dsh_author_define', 'dsh_author_run', 'dsh_author_validate', 'dsh_author_recover',
  'memo_classify', 'memo_format', 'memo_link', 'memo_scope', 'memo_archive', 'memo_review',
  'ptest_template', 'ptest_assertions', 'ptest_harness',
  'cdx_map', 'cdx_symbols', 'cdx_imports', 'cdx_owner', 'cdx_diff',
  'mem_write', 'mem_read', 'mem_search', 'mem_promote',
  'wf_compose', 'wf_run', 'wf_collect',
  'trc_mode_flow', 'trc_diff',
  'sphinx', 'drift', 'second_order', 'ultimate',
];

// ---------------------------------------------------------------------------
// Mount the bundle once with a fake harness/ctx, exactly like the host would.
// ---------------------------------------------------------------------------
function mountBundle() {
  const body = fs.readFileSync(MERGED, 'utf8');
  const captured = [];
  const harness = {
    defineTool: (def) => { captured.push(def); return def; },
    registerTool: () => () => {},
    handle: () => () => {},
  };
  const ctx = {
    get: () => undefined,
    on: () => () => {},
    provide: () => () => {},
    effect: (cb) => { try { const d = cb(); return typeof d === 'function' ? d : () => {}; } catch { return () => {}; } },
  };
  const plugin = new Function('harness', 'ctx', body)(harness, ctx);
  assert.ok(plugin && typeof plugin.apply === 'function', 'bundle must return { apply }');
  plugin.apply(ctx);
  return captured;
}

// ---------------------------------------------------------------------------
// The real host guard, if the deployment ships it. Skipped (not failed) when
// the module is absent, so the suite still runs on machines without DSH.
// ---------------------------------------------------------------------------
const GUARD_PATH = '/usr/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-cordis-host-runner/lib/types/guard.js';
const guard = fs.existsSync(GUARD_PATH) ? require(GUARD_PATH) : null;

test('bundle file exists and is non-trivial', () => {
  const stat = fs.statSync(MERGED);
  assert.ok(stat.size > 100_000, `merged bundle suspiciously small: ${stat.size} bytes`);
});

test(`bundle mounts and defines exactly ${EXPECTED_TOOLS.length} tools`, () => {
  const tools = mountBundle();
  const names = tools.map((t) => t.name);
  assert.equal(names.length, EXPECTED_TOOLS.length,
    `expected ${EXPECTED_TOOLS.length} tools, bundle defines ${names.length}: ${names.join(', ')}`);
  for (const name of EXPECTED_TOOLS) {
    assert.ok(names.includes(name), `missing tool: ${name}`);
  }
  assert.equal(new Set(names).size, names.length, 'duplicate tool name registered');
});

test('every tool schema passes the REAL host guard', { skip: !guard && 'DSH guard module not present on this machine' }, () => {
  const tools = mountBundle();
  for (const def of tools) {
    assert.doesNotThrow(() => {
      guard.sandboxDefineTool({
        name: def.name,
        description: def.description || def.name,
        execute: def.execute || (async () => ({})),
        parameters: def.parameters,
        output: def.output,
      });
    }, `${def.name}: schema rejected by the real guard`);
  }
});

test('the two parameter DSL forms stay mutually exclusive (regression: inverted contract)', { skip: !guard && 'DSH guard module not present on this machine' }, () => {
  const render = () => [{ type: 'text', text: 'x' }];
  const output = {
    schema: { type: 'object', properties: { t: { type: 'string', required: true } }, additionalProperties: false },
    render,
  };
  // Direct DSL: bare property map, per-property required:true — must PASS.
  assert.doesNotThrow(() => guard.sandboxDefineTool({
    name: 'x', description: 'd', execute: async () => ({}),
    parameters: { action: { type: 'string', enum: ['a'], required: true } }, output,
  }));
  // Raw wrapper + per-property required:true — must THROW (the doc bug).
  assert.throws(() => guard.sandboxDefineTool({
    name: 'x', description: 'd', execute: async () => ({}),
    parameters: { type: 'object', properties: { action: { type: 'string', required: true } } }, output,
  }), /belongs to the containing raw object schema/);
});

test('canonical skills: 14 dirs, each with SKILL.md naming its tools', () => {
  const dirs = fs.readdirSync(SKILLS_DIR).filter((d) => fs.statSync(path.join(SKILLS_DIR, d)).isDirectory());
  assert.equal(dirs.length, 14, `expected 14 canonical dynamic skills, found: ${dirs.join(', ')}`);
  for (const d of dirs) {
    const p = path.join(SKILLS_DIR, d, 'SKILL.md');
    assert.ok(fs.existsSync(p), `dynamic-skills/${d}/SKILL.md missing`);
    const txt = fs.readFileSync(p, 'utf8');
    assert.match(txt, /^---\n/, `${d}: SKILL.md must start with frontmatter`);
  }
});

test('no canonical skill pins a dead kind=existing recovery recipe (regression)', () => {
  const dirs = fs.readdirSync(SKILLS_DIR).filter((d) => fs.statSync(path.join(SKILLS_DIR, d)).isDirectory());
  for (const d of dirs) {
    const txt = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
    const fm = txt.match(/^---\n([\s\S]*?)\n---/);
    assert.ok(fm, `${d}: frontmatter missing`);
    assert.doesNotMatch(fm[1], /cordisDefine: "kind=existing/,
      `${d}: still pins a dead kind=existing recipe — after a restart that ID is gone`);
  }
});

test('README recovery recipe names at least one bundle path that exists on disk', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  // Collect every backtick-quoted path-like token that ends in dyno-pony.js.
  const tokens = [...readme.matchAll(/`([^`]*dyno-pony\.js)`/g)].map((m) => m[1]);
  assert.ok(tokens.length > 0, 'README must name the merged bundle path for the loader recipe');
  const expand = (p) => p.replace(/^~(?=\/|$)/, process.env.HOME || '');
  const existing = tokens.filter((t) => fs.existsSync(expand(t)));
  assert.ok(
    existing.length > 0,
    `README names bundle paths, none exist on disk — the entry tower is lying:\n  ${tokens.join('\n  ')}`,
  );
});
