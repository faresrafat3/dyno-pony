// ultimate test — 4 standard + 3 optional + 1 bonus + 7 registry/execute = 15 tests

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PACKAGES_DIR = path.join(__dirname, '..', 'packages');

function mount(file, opts = {}) {
  const registered = new Map();
  const effects = [];
  const services = new Map();
  const harness = {
    defineTool: (def) => def,
    registerTool: (_ctx, tool) => {
      registered.set(tool.name, tool);
      return () => registered.delete(tool.name);
    },
    handle: () => () => {},
  };
  const ctx = {
    get: (n) => services.get(n),
    on: () => () => {},
    effect: (cb) => { const d = cb(); effects.push(d); return d; },
    provide: (n, v) => { services.set(n, v); return () => services.delete(n); },
  };
  // A real host always exposes this read-only registry façade (host-runner
  // guard.js: { register, schemas, get }), reachable with no `inject`
  // declaration. `opts.registry` fakes its tool list, so the derivation in
  // ultimate.js can be exercised without booting a DSH host — and, crucially,
  // can be handed a list that CONTRADICTS the source's own list.
  if (opts.registry) {
    const views = () => opts.registry.map((name) => ({ name, description: name, parameters: {} }));
    ctx.tools = { schemas: views, get: (name) => views().find((s) => s.name === name) };
  }
  const body = fs.readFileSync(path.join(PACKAGES_DIR, file), 'utf8');
  const fn = new Function('ctx', 'harness', 'console', 'btoa', 'atob', 'TextEncoder', 'TextDecoder', body);
  const plugin = fn(ctx, harness, console, btoa, atob, TextEncoder, TextDecoder);
  if (plugin && typeof plugin.apply === 'function') plugin.apply(ctx);
  return { ctx, registered, effects };
}

async function call(registered, name, params = {}) {
  const tool = registered.get(name);
  if (!tool) throw new Error('tool not found: ' + name);
  const value = await tool.execute(params, params);
  return tool.output.render({}, value);
}

// The declared arsenal, read out of `status` on a host with NO registry — the
// only path on which the tool lists what it declares rather than what it
// measured. Used to build registries that contradict the declaration.
// tests/preflight.test.cjs is what pins this set to the bundle's real tools.
async function declaredNames() {
  const { registered } = mount('ultimate.js');
  const blocks = await call(registered, 'ultimate', { action: 'status' });
  const names = [...blocks[0].text.matchAll(/^- `([a-z0-9_]+)` — /gm)].map((m) => m[1]);
  assert.ok(names.length >= 30, `status listed only ${names.length} arsenal entries — the list is not being parsed`);
  return names;
}

// 4 required
test('ultimate: mounts without throwing', () => {
  assert.doesNotThrow(() => mount('ultimate.js'));
});
test('ultimate: registers the ultimate tool', () => {
  const { registered } = mount('ultimate.js');
  assert.ok(registered.has('ultimate'));
});
test('ultimate: tool has valid parameter schema', () => {
  const { registered } = mount('ultimate.js');
  const t = registered.get('ultimate');
  assert.equal(t.parameters.type, 'object');
  assert.ok(t.parameters.properties.action);
  assert.deepEqual(t.parameters.properties.action.enum, ['on', 'off', 'status']);
});
test('ultimate: tool has output block with schema + render', () => {
  const { registered } = mount('ultimate.js');
  const t = registered.get('ultimate');
  assert.ok(t.output);
  assert.ok(t.output.schema);
  assert.equal(typeof t.output.render, 'function');
});

// 3 optional
test('ultimate: every effect returns a disposer', () => {
  const { effects } = mount('ultimate.js');
  assert.ok(effects.length > 0);
  for (const d of effects) assert.equal(typeof d, 'function');
});
test('ultimate: uses harness.defineTool before registerTool', () => {
  const body = fs.readFileSync(path.join(PACKAGES_DIR, 'ultimate.js'), 'utf8');
  const dc = (body.match(/harness\.defineTool\s*\(/g) || []).length;
  const rc = (body.match(/harness\.registerTool\s*\(/g) || []).length;
  assert.ok(dc >= 1);
  assert.ok(rc >= 1);
});
test('ultimate: body ends with "};" not "});"', () => {
  const body = fs.readFileSync(path.join(PACKAGES_DIR, 'ultimate.js'), 'utf8');
  const trimmed = body.replace(/\s+$/g, '');
  assert.equal(trimmed.slice(-2), '};');
});

// 1 bonus
test('ultimate: tool render returns a text block', () => {
  const { registered } = mount('ultimate.js');
  const t = registered.get('ultimate');
  const rendered = t.output.render({}, 'sample');
  assert.ok(Array.isArray(rendered));
  assert.equal(rendered[0].type, 'text');
});

// 3 live execute
test('ultimate: on action returns the persona overlay', async () => {
  const declared = await declaredNames();
  const { registered } = mount('ultimate.js', { registry: declared });
  const blocks = await call(registered, 'ultimate', { action: 'on' });
  assert.ok(blocks[0].text.includes('ULTIMATE MODE'));
  assert.ok(blocks[0].text.includes('ARMED'));
  assert.ok(blocks[0].text.includes(`All ${declared.length} tools in the DSH arsenal are now available.`), blocks[0].text);
  assert.ok(blocks[0].text.includes('Persona overlay'));
});
test('ultimate: off action returns the disarm message', async () => {
  const declared = await declaredNames();
  const { registered } = mount('ultimate.js', { registry: declared });
  const blocks = await call(registered, 'ultimate', { action: 'off' });
  assert.ok(blocks[0].text.includes('DISARMED'));
  assert.ok(blocks[0].text.includes('baseline'));
  assert.ok(blocks[0].text.includes(`The ${declared.length} dyno-pony tools are still registered`), blocks[0].text);
});

// ---------------------------------------------------------------------------
// E6 — the count is derived, never hardcoded. Each of these hands the tool a
// registry that CONTRADICTS its own source list; a literal cannot follow, a
// measurement must. The declaration-against-bundle check lives in preflight,
// so the expectation here never comes from ultimate.js's own list.
// ---------------------------------------------------------------------------
test('ultimate: the count follows the registry, not a literal', async () => {
  const { registered } = mount('ultimate.js', { registry: ['ponytail', 'caveman', 'sphinx'] });
  const blocks = await call(registered, 'ultimate', { action: 'status' });
  assert.ok(blocks[0].text.includes('Total tools in the arsenal: 3 of'),
    `expected a registry-derived count of 3, got:\n${blocks[0].text}`);
});
test('ultimate: names what the registry is missing instead of a stale total', async () => {
  const declared = await declaredNames();
  const registry = declared.filter((n) => n !== 'sphinx');
  const { registered } = mount('ultimate.js', { registry });
  const blocks = await call(registered, 'ultimate', { action: 'status' });
  assert.ok(blocks[0].text.includes(`Total tools in the arsenal: ${declared.length - 1} of ${declared.length} registered`), blocks[0].text);
  assert.ok(blocks[0].text.includes('MISSING: sphinx'), blocks[0].text);
});
test('ultimate: counts its own arsenal, not every tool the host exposes', async () => {
  const declared = await declaredNames();
  const { registered } = mount('ultimate.js', { registry: declared.concat(['read', 'write', 'bash']) });
  const blocks = await call(registered, 'ultimate', { action: 'status' });
  assert.ok(blocks[0].text.includes(`Total tools in the arsenal: ${declared.length}.`), blocks[0].text);
});
test('ultimate: with no registry reachable the count declares itself unmeasured', async () => {
  const { registered } = mount('ultimate.js'); // the fake ctx exposes no ctx.tools
  const blocks = await call(registered, 'ultimate', { action: 'status' });
  assert.ok(blocks[0].text.includes('(declared — no tools registry on this ctx)'), blocks[0].text);
});
test('ultimate: status action returns the arsenal list', async () => {
  const { registered } = mount('ultimate.js');
  const blocks = await call(registered, 'ultimate', { action: 'status' });
  assert.ok(blocks[0].text.includes('STATUS'));
  assert.ok(blocks[0].text.includes('Arsenal'));
  // Spot-check that the arsenal includes sentinels + the merged plugins
  assert.ok(blocks[0].text.includes('sphinx'));
  assert.ok(blocks[0].text.includes('drift'));
  assert.ok(blocks[0].text.includes('second_order'));
  assert.ok(blocks[0].text.includes('ponytail'));
  assert.ok(blocks[0].text.includes('caveman'));
  assert.ok(blocks[0].text.includes('orch_route'));
});
