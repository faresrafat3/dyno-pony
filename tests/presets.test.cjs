// Presets test: load each agent.cordis.yml and assert it has the correct shape
// (id, description, config). The DSH agent-presets package parses these files;
// this test mirrors the same shape.
//
// WHERE THE FILES COME FROM. The canonical home is the runtime dir (PROTECTED.md):
// mounting a preset is a composition decision, and install.sh refuses to write
// them. That made this suite machine-dependent — 9 tests failed under an empty
// HOME, so no CI could ever run it. `tests/fixtures/agent-presets/` is committed
// as a VERIFICATION INPUT, not a second source of truth:
//   - live runtime dir present  -> validate IT (unchanged behaviour), and the
//                                  drift test at the bottom proves the mirror matches it
//   - absent (CI, fresh clone)  -> validate the committed mirror
//   - DSH_AGENT_PRESETS set     -> validate that dir (explicit override wins)

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'agent-presets');
const RUNTIME_DIR = path.join(process.env.HOME || '', '.agent-presets');
const OVERRIDE = process.env.DSH_AGENT_PRESETS;

const PRESETS_DIR = OVERRIDE || (fs.existsSync(RUNTIME_DIR) ? RUNTIME_DIR : FIXTURE_DIR);
// Drift is only checkable where the live presets exist to compare against.
const LIVE_DIR = OVERRIDE ? null : (fs.existsSync(RUNTIME_DIR) ? RUNTIME_DIR : null);

const EXPECTED_PRESETS = [
  { id: 'baseline',     description_includes: 'Vanilla DSH session' },
  { id: 'simple',       description_includes: 'default dyno-pony plugins' },
  { id: 'pony-mode',    description_includes: 'Lazy senior dev mode' },
  { id: 'caveman-mode', description_includes: 'Terse prose mode' },
  { id: 'sentinel-mode', description_includes: 'opt-in preset for the dyno-pony session sentinels' },
  { id: 'ultimate-mode', description_includes: 'go all out' },
];

// First, sanity-check that the directory exists and is readable.
test('presets: directory exists and is readable', () => {
  assert.ok(fs.existsSync(PRESETS_DIR), `presets dir not found: ${PRESETS_DIR}`);
  const stat = fs.statSync(PRESETS_DIR);
  assert.ok(stat.isDirectory(), `${PRESETS_DIR} is not a directory`);
});

for (const { id, description_includes } of EXPECTED_PRESETS) {
  test(`presets: ${id}/agent.cordis.yml exists and is valid`, () => {
    const file = path.join(PRESETS_DIR, id, 'agent.cordis.yml');
    assert.ok(fs.existsSync(file), `preset file not found: ${file}`);
    const body = fs.readFileSync(file, 'utf8');
    // Minimal YAML shape: a YAML array whose first entry has id, description, config.
    // We parse just enough to verify (the DSH agent-presets package does the full
    // YAML parse; we only check string-level invariants here).
    assert.ok(body.includes('id: ' + id), `preset ${id} must include "id: ${id}"`);
    assert.ok(body.includes('description:'), `preset ${id} must include "description:"`);
    assert.ok(body.toLowerCase().includes(description_includes.toLowerCase()),
      `preset ${id} description should mention "${description_includes}"`);
    // Must be a top-level YAML array (starts with `- ` after comments).
    const lines = body.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    assert.ok(lines[0].startsWith('- '), `preset ${id} must start with "- " (YAML array)`);
  });
}

test('presets: no extra/unknown presets', () => {
  // This used to `return` when the directory was missing, which reports PASS while
  // checking nothing — the same silent-green shape as a skipped-but-counted test.
  // The first test above already asserts the directory exists, so failing is honest.
  assert.ok(fs.existsSync(PRESETS_DIR), `presets dir not found: ${PRESETS_DIR}`);
  const dirs = fs.readdirSync(PRESETS_DIR).filter((d) => {
    const full = path.join(PRESETS_DIR, d);
    return fs.statSync(full).isDirectory();
  });
  const expectedIds = EXPECTED_PRESETS.map((p) => p.id);
  for (const d of dirs) {
    assert.ok(expectedIds.includes(d), `unexpected preset dir: ${d}; expected one of ${expectedIds.join(', ')}`);
  }
});

test('presets: committed mirror matches the live runtime presets', { skip: LIVE_DIR ? false : 'no live ~/.agent-presets on this machine — the committed mirror is the only copy here' }, () => {
  // The mirror is a copy, so it can rot. Nothing else would notice: CI validates
  // the mirror, so a stale copy would pass there while the live preset drifted.
  // Floor first (E9): a comparison that examines nothing must not report success.
  assert.ok(LIVE_DIR !== null, 'the drift check needs a live presets dir; it is skipped without one');
  const mirrored = fs.readdirSync(FIXTURE_DIR).filter((d) => fs.statSync(path.join(FIXTURE_DIR, d)).isDirectory());
  assert.ok(mirrored.length >= EXPECTED_PRESETS.length,
    `mirror carries only ${mirrored.length} presets; expected at least ${EXPECTED_PRESETS.length} — a smaller set would compare vacuously`);
  for (const id of mirrored) {
    const live = path.join(LIVE_DIR, id, 'agent.cordis.yml');
    assert.ok(fs.existsSync(live), `live presets are missing ${id}, which the committed mirror carries`);
    assert.equal(
      fs.readFileSync(path.join(FIXTURE_DIR, id, 'agent.cordis.yml'), 'utf8'),
      fs.readFileSync(live, 'utf8'),
      `mirror for ${id} has drifted from the live preset — re-copy it into tests/fixtures/agent-presets/${id}/`,
    );
  }
});

test('presets: baseline has no active plugins, others have at least 1', () => {
  // Each preset's description must list which plugins it activates.
  // baseline = 0; simple = pony+caveman+orch; pony-mode = pony+orch; caveman-mode = caveman+orch.
  const expectations = [
    { id: 'baseline',     expected: [] },
    { id: 'simple',       expectedAny: ['pony', 'caveman', 'orch'] },
    { id: 'pony-mode',    expectedAny: ['pony', 'orch'] },
    { id: 'caveman-mode', expectedAny: ['caveman', 'orch'] },
  ];
  for (const { id, expected, expectedAny } of expectations) {
    const file = path.join(PRESETS_DIR, id, 'agent.cordis.yml');
    if (!fs.existsSync(file)) continue;
    const body = fs.readFileSync(file, 'utf8').toLowerCase();
    // baseline's description MUST say "no" plugins and "vanilla" — both words must appear.
    if (id === 'baseline') {
      assert.ok(body.includes('vanilla'), `baseline should describe itself as vanilla`);
      assert.ok(body.includes('zero') || body.includes('no ') || body.includes('none'),
        `baseline should say it has no plugins`);
    } else {
      const mentions = expectedAny.filter((p) => body.includes(p));
      assert.ok(mentions.length >= 1,
        `${id} should mention at least one of [${expectedAny.join(', ')}]; found [${mentions.join(', ')}]`);
    }
  }
});
