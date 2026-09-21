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
// A third failure (2026-09-21): rebuild.sh still stated "34 tools / 10 skills /
// 4 presets" months after the merge took the arsenal to 38 / 14 / 6, and
// nothing checked the script — so it kept teaching the next agent a false
// count (E6: counters are derived, never hardcoded).
//
// Green here means: the bundle parses, defines exactly the tools EXPECTED_TOOLS
// names, every tool schema passes the REAL host guard (sandboxDefineTool from
// @deepseek-ai/dsh-cordis-host-runner), the counts each document states match
// disk (rebuild.sh is executed and its numbers compared), and the canonical
// skill docs agree with disk reality. If this suite is red, do not ship and do
// not trust the docs — fix the red line first.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');
const MERGED = path.join(PACKAGES_DIR, 'dyno-pony.js');
const SKILLS_DIR = path.join(ROOT, 'dynamic-skills');
const PROSE_SKILLS_DIR = path.join(ROOT, 'skills');
const TESTS_DIR = path.join(ROOT, 'tests');
const counts = require(path.join(ROOT, 'scripts', 'counts.cjs'));

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
function mountBundle(opts = {}) {
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
  // The read-only registry façade a real host always exposes (host-runner
  // guard.js: { register, schemas, get }). Passing a list lets a test hand the
  // bundle a registry that contradicts what its own source declares.
  if (opts.registry) {
    const views = () => opts.registry.map((name) => ({ name, description: name, parameters: {} }));
    ctx.tools = { schemas: views, get: (name) => views().find((s) => s.name === name) };
  }
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

// rebuild.sh is a documentation script, so it is executed here and the numbers
// it prints are compared against disk (see the doc-agreement tests at the end).
const REBUILD = spawnSync('bash', [path.join(ROOT, 'rebuild.sh')], { encoding: 'utf8' });
const BASH_MISSING = Boolean(REBUILD.error) || REBUILD.status === null;

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

test('no canonical skill pins a dead per-plugin id (regression)', () => {
  const dirs = fs.readdirSync(SKILLS_DIR).filter((d) => fs.statSync(path.join(SKILLS_DIR, d)).isDirectory());
  for (const d of dirs) {
    const txt = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
    const fm = txt.match(/^---\n([\s\S]*?)\n---/);
    assert.ok(fm, `${d}: frontmatter missing`);
    assert.doesNotMatch(fm[1], /cordisDefine: "kind=existing/,
      `${d}: still pins a dead kind=existing recipe — after a restart that ID is gone`);
    // Since the merge (2026-09-04) every tool ships in ONE bundle mounted under a
    // fresh dyno-* id, so a per-plugin id or a pkg-N in the body is dead too —
    // the frontmatter is not the only place this rot hides (E5).
    assert.doesNotMatch(txt, /pluginId[:=]\s*"?[a-z][a-z0-9]*-\d|packageId[:=]\s*"?pkg-\d/,
      `${d}: names a per-plugin id / package id that a restart kills — point at the merged bundle`);
    assert.doesNotMatch(txt, /kind=existing/,
      `${d}: prescribes kind=existing, which cannot work after a restart`);
  }
});

// ---------------------------------------------------------------------------
// The skills-to-source seam. A SKILL.md declares which actions it drives, and
// nothing checked that those actions still exist: a renamed or dropped action
// would rot the doc silently, and the model would call something that is not
// there. Ledger item 3 in AGENT-ERGONOMICS.md.
// ---------------------------------------------------------------------------
test('every action a dynamic SKILL.md declares is one the bundle still provides', () => {
  const tools = mountBundle();
  const toolByName = new Map(tools.map((t) => [t.name, t]));
  const actionEnum = (t) => {
    const e = t && t.parameters && t.parameters.properties && t.parameters.properties.action
      && t.parameters.properties.action.enum;
    return Array.isArray(e) ? e : null;
  };
  const everyEnum = tools.map(actionEnum).filter(Boolean).flat();

  const dirs = fs.readdirSync(SKILLS_DIR).filter((d) => fs.statSync(path.join(SKILLS_DIR, d)).isDirectory());
  const unresolved = [];
  const mismatched = [];
  let checked = 0;

  for (const dir of dirs) {
    const txt = fs.readFileSync(path.join(SKILLS_DIR, dir, 'SKILL.md'), 'utf8');
    const list = txt.match(/^\s*actions:\s*\[([^\]]*)\]/m);
    // Every dynamic skill drives a tool group, so each must declare its actions —
    // a skill that declares none is a skill this check cannot see.
    assert.ok(list, `dynamic-skills/${dir}/SKILL.md declares no \`actions:\` — it is invisible to this check`);
    const actions = list[1].split(',').map((s) => s.trim()).filter(Boolean);
    checked += 1;

    // Where the skill's name IS a tool (allowing `-` for `_`, as second-order is
    // second_order), that tool's own enum is the authority and the two must agree
    // BOTH ways — an action the doc forgot is as much rot as one it invented.
    const homonym = toolByName.has(dir) ? dir : (toolByName.has(dir.replace(/-/g, '_')) ? dir.replace(/-/g, '_') : null);
    const enums = homonym ? actionEnum(toolByName.get(homonym)) : null;
    if (enums) {
      const docOnly = actions.filter((a) => !enums.includes(a));
      const toolOnly = enums.filter((a) => !actions.includes(a));
      if (docOnly.length || toolOnly.length) {
        mismatched.push(`${dir}: doc-only [${docOnly.join(', ')}], tool-only [${toolOnly.join(', ')}]`);
      }
      continue;
    }

    // The group skills (codex to cdx_*, memo to memo_*, dsh-author to
    // dsh_author_*, …) have no name to bind to, and that mapping lives in prose;
    // a table here would be a new thing to rot. So the check is the weaker, still
    // useful one: every action the doc names exists somewhere in the bundle.
    for (const a of actions) {
      if (!toolByName.has(a) && !everyEnum.includes(a)) unresolved.push(`${dir}:${a}`);
    }
  }

  // E9: the floor is the whole set of dynamic skills, taken from disk, so a parse
  // that silently matches nothing fails instead of reporting success.
  assert.equal(checked, dirs.length, `only ${checked} of ${dirs.length} dynamic skills were checked`);
  assert.equal(unresolved.length, 0,
    `a skill names an action no tool provides (doc rot at the seam): ${unresolved.join(', ')}`);
  assert.equal(mismatched.length, 0,
    `a skill's action list disagrees with its own tool: ${mismatched.join(' | ')}`);
});

test('every "N tools" claim in a skill doc is the bundle\'s real count', () => {
  const c = counts.compute();
  const claims = [];
  for (const tree of ['dynamic-skills', 'skills']) {
    const base = path.join(ROOT, tree);
    if (!fs.existsSync(base)) continue;
    for (const dir of fs.readdirSync(base).sort()) {
      const file = path.join(base, dir, 'SKILL.md');
      if (!fs.existsSync(file)) continue;
      fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        // Plural only: "7 tool calls" in sphinx's worked example is a usage count,
        // not a claim about the bundle.
        for (const m of line.matchAll(/\b(\d+)\s+tools\b/g)) {
          claims.push({ where: `${tree}/${dir}/SKILL.md:${i + 1}`, n: Number(m[1]) });
        }
      });
    }
  }
  // E9 floor: two docs state the bundle's size today. If the scan breaks, this
  // fails rather than reporting that every claim it never found is correct.
  assert.ok(claims.length >= 2, `only ${claims.length} "N tools" claim(s) found — the scan is what broke, not the docs`);
  const wrong = claims.filter((x) => x.n !== c.tools);
  assert.equal(wrong.length, 0,
    `skill doc states a tool count disk disagrees with: ${wrong.map((x) => `${x.where} says ${x.n}, disk says ${c.tools}`).join('; ')}`);
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

// ---------------------------------------------------------------------------
// Doc agreement — every count a durable document states must come from disk.
// scripts/counts.cjs derives them; these tests cross-check the derivation
// against this file's own mount, then against what the documents actually say.
// ---------------------------------------------------------------------------
test('counts: the merge manifest, the bundle markers, and the mounted tools agree', () => {
  const c = counts.compute();
  assert.equal(c.tools, EXPECTED_TOOLS.length,
    `scripts/counts.cjs mounted ${c.tools} tools, this oracle expects ${EXPECTED_TOOLS.length}`);
  assert.equal(c.sectionTools, c.tools,
    `the bundle's section markers sum to ${c.sectionTools} but ${c.tools} tools mount — rebuild the bundle`);
  assert.deepEqual(
    c.sections.map((s) => s.name).sort(),
    c.sourceFiles.map((f) => f.replace(/\.js$/, '')).sort(),
    'the merged sections must be exactly the ORDER manifest in scripts/merge-plugins.cjs',
  );
  assert.equal(c.sourcesPresent, c.sources,
    'a source named in the ORDER manifest is missing from packages/');
  assert.equal(c.packageFiles - c.plugins, c.sources,
    'packages/*.js minus the merged bundle(s) must equal the ORDER manifest');
  assert.equal(c.plugins, 1, `expected exactly 1 merged plugin file in packages/, found ${c.plugins}`);

  const skillDirs = fs.readdirSync(SKILLS_DIR).filter((d) => fs.statSync(path.join(SKILLS_DIR, d)).isDirectory());
  assert.equal(c.skills, skillDirs.length,
    `counts.cjs says ${c.skills} skills, dynamic-skills/ holds ${skillDirs.length} dirs`);

  // The generated header states the merge arithmetic. It is stamped by the
  // merger from what it actually merged, so it must agree with the bundle it
  // was written into — otherwise the artifact carries its own stale count (E6).
  const header = fs.readFileSync(MERGED, 'utf8').slice(0, fs.readFileSync(MERGED, 'utf8').indexOf('return {'));
  const stated = header.match(/Tool count: (\d+) \(orig\+sentinels\) \+ (\d+) \(ultimate\) = (\d+) tools/);
  assert.ok(stated, 'the merged bundle header must state its tool count');
  assert.equal(Number(stated[3]), c.tools,
    `the bundle header claims ${stated[3]} tools, ${c.tools} actually mount`);
  assert.equal(Number(stated[1]) + Number(stated[2]), Number(stated[3]),
    'the header arithmetic must add up');
});

// ---------------------------------------------------------------------------
// The `ultimate` tool's count. E6 says a surface that reports "N tools" must
// derive N from what it actually registered, and P4 in AGENT-ERGONOMICS.md is
// the failure that rule exists for: `ultimate` said 37 while the registry held
// 38. The expectation below is THIS file's EXPECTED_TOOLS, which is independent
// of packages/ultimate.js — so a literal in that source cannot satisfy it.
// ---------------------------------------------------------------------------
test('ultimate: its arsenal is exactly the bundle\'s tools, and its count is the registry\'s', async () => {
  const tools = mountBundle({ registry: EXPECTED_TOOLS });
  const ultimate = tools.find((t) => t.name === 'ultimate');
  assert.ok(ultimate, 'the bundle must register an `ultimate` tool');

  const text = await ultimate.execute({ action: 'status' }, { action: 'status' });

  // The declared list must BE the bundle's tool set: one `- \`name\` — role`
  // line per tool. The length is asserted first so an unparsed or emptied list
  // fails loudly instead of comparing nothing (E9).
  const declared = [...text.matchAll(/^- `([a-z0-9_]+)` — /gm)].map((m) => m[1]);
  assert.equal(declared.length, EXPECTED_TOOLS.length,
    `ultimate lists ${declared.length} arsenal tools, the bundle registers ${EXPECTED_TOOLS.length}`);
  assert.deepEqual(declared.slice().sort(), EXPECTED_TOOLS.slice().sort(),
    'ultimate\'s declared arsenal has drifted from the tools the bundle actually registers');

  // And the number it prints must be the one the registry handed it.
  assert.ok(text.includes(`Total tools in the arsenal: ${EXPECTED_TOOLS.length}.`),
    `expected a registry-derived count of ${EXPECTED_TOOLS.length}, got:\n${text}`);
});

test('ultimate: reports a MISSING arsenal tool instead of an unchanged total', async () => {
  const short = EXPECTED_TOOLS.filter((n) => n !== 'sphinx');
  const tools = mountBundle({ registry: short });
  const ultimate = tools.find((t) => t.name === 'ultimate');
  const text = await ultimate.execute({ action: 'status' }, { action: 'status' });
  assert.ok(text.includes(`Total tools in the arsenal: ${short.length} of ${EXPECTED_TOOLS.length} registered`),
    `a registry one tool short must change the total, got:\n${text}`);
  assert.ok(text.includes('MISSING: sphinx'), text);
});

test('rebuild.sh prints the derived counts, never remembered ones', { skip: BASH_MISSING && 'bash is not available on this machine' }, () => {  assert.equal(REBUILD.status, 0, `rebuild.sh exited ${REBUILD.status}:\n${REBUILD.stderr}`);
  const out = REBUILD.stdout;
  const c = counts.compute();

  const line = out.match(/\[rebuild\] counts: tools=(\d+) plugins=(\d+) sources=(\d+) skills=(\d+) presets=(\d+)/);
  assert.ok(line, 'rebuild.sh must print a `[rebuild] counts:` line derived by scripts/counts.cjs');
  const stated = { tools: +line[1], plugins: +line[2], sources: +line[3], skills: +line[4], presets: +line[5] };
  for (const key of Object.keys(stated)) {
    assert.equal(stated[key], c[key], `rebuild.sh states ${key}=${stated[key]}, disk says ${c[key]}`);
  }

  assert.match(out, new RegExp(`\\b${c.tools} tools\\b`), 'the prose must state the real tool count');
  assert.match(out, new RegExp(`\\b${c.sources} sources\\b`), 'the prose must state the real source count');
  assert.doesNotMatch(out, /pluginId=(?:dp|pkg)-\d+|kind=existing/,
    'rebuild.sh must not pin a process-local plugin id — after a restart that id is dead (E5)');
  for (const stale of ['34 tools', '10 skills', '4 presets', '2013 lines', '10 source files', 'the 15 originals', '100KB']) {
    const pattern = stale.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.doesNotMatch(out, new RegExp(`\\b${pattern}`),
      `rebuild.sh still teaches a stale count: "${stale}"`);
  }
});

test('the merged bundle header prescribes no dead recovery recipe (regression)', () => {
  const bundle = fs.readFileSync(MERGED, 'utf8');
  // Only the generated header (everything before the plugin body): a tool body
  // may legitimately discuss recovery, the header must not pin a dead id (E5).
  const header = bundle.slice(0, bundle.indexOf('return {'));
  assert.doesNotMatch(header, /kind=existing|pluginId=(?:dp|pkg)-\d/,
    'the bundle header tells the next agent to re-apply a process-local id that a restart kills');
});

test('README §Skills names every skill on disk, and names no ghost', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const trees = [
    ['dynamic-skills', SKILLS_DIR],
    ['skills', path.join(ROOT, 'skills')],
  ];
  for (const [tree, dir] of trees) {
    const onDisk = fs.readdirSync(dir).filter((d) => fs.statSync(path.join(dir, d)).isDirectory());
    for (const name of onDisk) {
      const named = new RegExp(`(?:^|[\\s·(])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[\\s·),]|$)`, 'm');
      assert.match(readme, named,
        `${tree}/${name} is on disk but README never names it — a skill nobody can find is a skill nobody runs`);
    }
  }
  // The other direction: every name the README lists under these trees must exist.
  const dynamicList = readme.match(/\*\*Dynamic \(.*?\):\*\*([\s\S]*?)\n\n/);
  assert.ok(dynamicList, 'README must carry the Dynamic skills list');
  const listed = dynamicList[1].split('·').map((s) => s.trim()).filter(Boolean);
  const dirs = fs.readdirSync(SKILLS_DIR);
  for (const name of listed) {
    assert.ok(dirs.includes(name), `README lists dynamic skill "${name}", which is not in dynamic-skills/`);
  }

  // The same reverse direction for the PROSE tree. Only the disk->README direction
  // covered it, so deleting all 24 prose skills left the whole suite at 176 pass / 0
  // fail: the README still listed them and nothing asked whether they existed.
  const proseList = readme.match(/\*\*Prose \(.*?\):\*\*([\s\S]*?)\n\n/);
  assert.ok(proseList, 'README must carry the Prose skills list');
  const proseNames = proseList[1].split('·').map((s) => s.trim()).filter(Boolean);
  assert.ok(proseNames.length > 0, 'the README Prose list is empty — nothing to check, so nothing is checked');
  const proseDirs = fs.readdirSync(PROSE_SKILLS_DIR)
    .filter((d) => fs.statSync(path.join(PROSE_SKILLS_DIR, d)).isDirectory());
  for (const name of proseNames) {
    assert.ok(proseDirs.includes(name),
      `README lists prose skill "${name}", which is not in skills/ — a documented skill nobody can run`);
  }
});

test('the suite is intact: no test file was deleted or emptied', () => {
  /*
   * node --test cannot notice its own shrinkage. Deleting tests/drift.test.cjs took
   * the run from 176 to 165 tests and emptying tests/conformance.test.cjs took it to
   * 161 — both reported "0 fail" and exited 0, because a file with no tests is simply
   * a file that passes. The files are the input here, so no count is self-derived.
   */
  const MIN_TEST_FILES = 11;
  const files = fs.readdirSync(TESTS_DIR).filter((f) => f.endsWith('.test.cjs'));
  assert.ok(files.length >= MIN_TEST_FILES,
    `only ${files.length} test file(s), expected at least ${MIN_TEST_FILES}: ${files.join(', ')}`);

  const inert = [];
  for (const f of files) {
    const body = fs.readFileSync(path.join(TESTS_DIR, f), 'utf8');
    const declaresTests = /^\s*(test|it)\(/m.test(body);
    // A file may also be a hand-rolled verifier, but then it must be able to fail.
    const canFail = /assert\./.test(body) || /process\.exit\(\s*[1-9]/.test(body);
    if (body.trim().length === 0 || (!declaresTests && !canFail)) inert.push(f);
  }
  assert.equal(inert.length, 0,
    `test file(s) declare no tests and cannot fail, so they only ever pass: ${inert.join(', ')}`);
});

test('README states the same counts as disk', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const c = counts.compute();
  const verified = readme.match(/Verified state:.*$/m);
  assert.ok(verified, 'README must carry a "Verified state:" line');
  assert.match(verified[0], new RegExp(`\\b${c.plugins} merged plugin\\b`),
    'README Verified state must state the real plugin count');
  assert.match(verified[0], new RegExp(`\\b${c.tools} tools\\b`),
    'README Verified state must state the real tool count');
  assert.match(verified[0], new RegExp(`\\b${c.skills} dynamic skills\\b`),
    'README Verified state must state the real skill count');
  assert.match(readme, new RegExp(`the ${c.sources} originals`),
    'README layout must state the real source count');
});
