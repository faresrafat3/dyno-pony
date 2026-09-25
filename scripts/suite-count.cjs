#!/usr/bin/env node
'use strict';
// suite-count.cjs — measure the suite by RUNNING it, then compare that measurement
// against a recorded pin, so a silent drop in the number of tests fails the build.
//
// WHY THIS EXISTS
// ---------------
// `node --test` cannot notice its own shrinkage. A file that loses half its tests
// still exists, still reports "0 fail", and still exits 0. preflight's "the suite is
// intact" check covers the FILE level (>= 11 files, none inert) and says so itself:
// emptying tests/conformance.test.cjs took the run from 176 to 161 tests and nothing
// noticed. Nothing covered the count INSIDE a file. This does.
//
// MEASURE, DON'T GUESS (E9)
// -------------------------
// A test count cannot be derived from a file — it only exists once the suite runs.
// So the files are DISCOVERED from disk, each is RUN, and the results are summed:
// that is the measurement. `tests/expected-suite.json` is not the truth, it is the
// memory of the last deliberate measurement. Per-file totals are pinned because they
// are environment-stable (verified identical under a real and an empty HOME), and a
// per-file pin is what names the file that shrank.
//
// The comparison is EQUALITY, not ">=": a floor alone would let someone add two tests
// and quietly delete two others. Both directions are deliberate —
//
//   node scripts/suite-count.cjs            # verify; exit 1 on any change
//   node scripts/suite-count.cjs --update   # re-pin after an intended change
//
// Two floors sit outside this file's own logic, so a parse that yields nothing can
// never compare equal to itself: a missing summary line is a hard failure, and the
// pin's `floor` is asserted regardless of the per-file comparison.

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const TESTS_DIR = path.join(ROOT, 'tests');
const PIN_PATH = path.join(TESTS_DIR, 'expected-suite.json');
const SUFFIX = '.test.cjs';

function testFiles() {
  return fs
    .readdirSync(TESTS_DIR)
    .filter((f) => f.endsWith(SUFFIX))
    .sort();
}

/** Run one test file and read the runner's own summary. Throws if it parsed nothing. */
function measureOne(file) {
  const run = spawnSync(
    process.execPath,
    ['--test', '--test-reporter=tap', path.join(TESTS_DIR, file)],
    { cwd: ROOT, encoding: 'utf8' },
  );
  const out = `${run.stdout || ''}${run.stderr || ''}`;
  const num = (label) => {
    const m = [...out.matchAll(new RegExp(`^# ${label} (\\d+)$`, 'gm'))];
    return m.length ? Number(m[m.length - 1][1]) : null;
  };
  const total = num('tests');
  if (total === null) {
    // Never a silent zero: a file whose summary cannot be read is a failure here.
    throw new Error(
      `${file}: could not read a "# tests N" summary from the runner (exit ${run.status}).\n` +
        `If this file was emptied or is no longer a node:test file, this is the failure.\n` +
        `--- tail of output ---\n${out.split('\n').slice(-15).join('\n')}`,
    );
  }
  return { total, pass: num('pass'), fail: num('fail'), skipped: num('skipped') };
}

function measure() {
  const files = testFiles();
  const per = {};
  const totals = { total: 0, pass: 0, fail: 0, skipped: 0 };
  for (const f of files) {
    const r = measureOne(f);
    per[f] = r.total;
    totals.total += r.total;
    totals.pass += r.pass ?? 0;
    totals.fail += r.fail ?? 0;
    totals.skipped += r.skipped ?? 0;
  }
  return { files, per, totals };
}

function readPin() {
  if (!fs.existsSync(PIN_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(PIN_PATH, 'utf8'));
  } catch (e) {
    console.error(`suite-count: ${path.relative(ROOT, PIN_PATH)} is not valid JSON — ${e.message}`);
    process.exit(2);
  }
}

function buildPin(m) {
  const previous = readPin();
  return {
    what:
      'Per-file test totals, MEASURED by running each tests/*.test.cjs file. ' +
      'Not written by hand: node scripts/suite-count.cjs --update. ' +
      'Compared by equality in CI, so a silent shrink fails the build.',
    recordedAt: new Date().toISOString().slice(0, 10),
    measuredOn: process.version,
    fileCount: m.files.length,
    // Absolute floor, asserted independently of the comparison. Kept once recorded.
    floor: (previous && previous.floor) || Math.floor(m.totals.total * 0.8),
    total: m.totals.total,
    files: m.per,
  };
}

function diff(pin, m) {
  const problems = [];
  const pinnedNames = Object.keys(pin.files || {});
  for (const f of pinnedNames) {
    if (!(f in m.per)) problems.push(`  - ${f}: gone (had ${pin.files[f]} tests)`);
    else if (m.per[f] !== pin.files[f]) {
      const delta = m.per[f] - pin.files[f];
      problems.push(
        `  - ${f}: ${pin.files[f]} -> ${m.per[f]} (${delta > 0 ? '+' : ''}${delta})` +
          (delta < 0 ? '   <-- LOST TESTS' : ''),
      );
    }
  }
  for (const f of Object.keys(m.per)) {
    if (!(f in (pin.files || {}))) problems.push(`  + ${f}: new file (${m.per[f]} tests)`);
  }
  return problems;
}

function main() {
  const update = process.argv.includes('--update');
  const m = measure();
  const pin = readPin();

  console.log(
    `suite-count: ${m.files.length} files, ${m.totals.total} tests ` +
      `(${m.totals.pass} pass, ${m.totals.fail} fail, ${m.totals.skipped} skipped)`,
  );

  if (update) {
    const next = buildPin(m);
    fs.writeFileSync(PIN_PATH, `${JSON.stringify(next, null, 2)}\n`);
    console.log(
      `suite-count: pinned ${next.total} tests across ${next.fileCount} files ` +
        `(floor ${next.floor}) -> ${path.relative(ROOT, PIN_PATH)}`,
    );
    process.exit(0);
  }

  if (pin === null) {
    console.error(
      `suite-count: no ${path.relative(ROOT, PIN_PATH)} — nothing to compare against.\n` +
        'Run: node scripts/suite-count.cjs --update',
    );
    process.exit(2);
  }

  // Floor first: a pin compared against nothing must not be able to pass.
  const problems = [];
  if (m.totals.total < pin.floor) {
    problems.push(
      `  ! total ${m.totals.total} is below the recorded floor ${pin.floor} — the measurement itself is suspect`,
    );
  }
  if (m.files.length < pin.fileCount) {
    problems.push(`  ! ${m.files.length} test files, down from ${pin.fileCount}`);
  }
  if (m.totals.fail > 0) {
    problems.push(`  ! ${m.totals.fail} test(s) failed`);
  }
  problems.push(...diff(pin, m));

  if (problems.length > 0) {
    console.error(`\nsuite-count: FAILED — the suite is not what it was pinned to be.\n`);
    for (const p of problems) console.error(p);
    console.error(
      `\nPinned: ${pin.total} tests across ${pin.fileCount} files (${pin.recordedAt}).\n` +
        `Measured: ${m.totals.total} tests across ${m.files.length} files.\n\n` +
        'If the change is intended, re-pin it deliberately:\n' +
        '  node scripts/suite-count.cjs --update\n' +
        'If it is not, a test disappeared — restore it. Deleting tests never re-pins itself.\n',
    );
    process.exit(1);
  }

  console.log(
    `suite-count: OK — matches the pin (${pin.total} tests, ${pin.fileCount} files, ` +
      `recorded ${pin.recordedAt}).`,
  );
}

main();
