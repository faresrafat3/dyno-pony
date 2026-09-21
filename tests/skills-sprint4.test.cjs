#!/usr/bin/env node
// verify-skills.js — sanity-check every prose skill in skills/.
//
// The size floor used to be "30 lines". Since the 2026-09-20 compression pass
// (collected 2026-09-21) a faithful skill writes a sentence-group per line, so
// line count stopped measuring substance: `prototype` and `research` kept every
// rule and section but dropped to 26 lines. The floor is now lines OR bytes —
// byte count is what a stub actually fails.

'use strict';
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
const skills = entries.filter(e => e.isDirectory()).map(e => e.name).sort();

// A coverage floor. Without it an empty tree printed "pass: 0 / 0, fail: 0" and
// exited 0 — green while verifying nothing, which is the one outcome a verifier
// must never report. 24 is the prose tree README documents under `skills/`.
const MIN_SKILLS = 24;

let pass = 0, fail = 0;
const names = new Set();
const issues = [];

for (const dir of skills) {
  const p = path.join(SKILLS_DIR, dir, 'SKILL.md');
  if (!fs.existsSync(p)) {
    issues.push({ dir, kind: 'missing' });
    fail++;
    continue;
  }
  const body = fs.readFileSync(p, 'utf8');
  const lines = body.split('\n');

  if (lines[0] !== '---') {
    issues.push({ dir, kind: 'no-frontmatter' });
    fail++;
    continue;
  }
  let end = lines.indexOf('---', 1);
  if (end === -1) {
    issues.push({ dir, kind: 'unterminated-frontmatter' });
    fail++;
    continue;
  }

  // Parse frontmatter with multi-line support.
  // metadata: is a block; collect until we hit a non-indented top-level key.
  const fm = {};
  let i = 1;
  while (i < end) {
    const line = lines[i];
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) {
      fm[m[1]] = m[2].trim();
      i++;
    } else {
      // indented continuation: append to last key
      const last = Object.keys(fm).pop();
      if (last && line.startsWith(' ') && line.trim()) {
        fm[last] += ' ' + line.trim();
      }
      i++;
    }
  }

  const required = ['name', 'description', 'whenToUse'];
  const missing = required.filter(k => !fm[k]);
  if (missing.length) {
    issues.push({ dir, kind: 'missing-fm-key', keys: missing });
    fail++;
    continue;
  }

  if (!fm.metadata) {
    issues.push({ dir, kind: 'missing-metadata' });
    fail++;
    continue;
  }

  if (fm.name !== dir) {
    issues.push({ dir, kind: 'name-mismatch', name: fm.name, dir });
    fail++;
    continue;
  }

  if (names.has(fm.name)) {
    issues.push({ dir, kind: 'duplicate-name', name: fm.name });
    fail++;
    continue;
  }
  names.add(fm.name);

  const bytes = Buffer.byteLength(body, 'utf8');
  if (lines.length < 20 || lines.length > 280) {
    issues.push({ dir, kind: 'body-length', lines: lines.length });
    fail++;
    continue;
  }
  if (bytes < 1500) {
    issues.push({ dir, kind: 'body-too-thin', bytes });
    fail++;
    continue;
  }

  pass++;
  console.log('  ✓ ' + fm.name + ' (' + lines.length + ' lines)');
}

console.log('');
console.log('pass: ' + pass + ' / ' + skills.length);
console.log('fail: ' + fail);
if (skills.length < MIN_SKILLS) {
  issues.push({ dir: SKILLS_DIR, kind: 'too-few-skills', keys: [skills.length + ' < ' + MIN_SKILLS] });
}
if (issues.length) {
  console.log('--- issues ---');
  for (const i of issues) console.log('  ' + i.kind + ' in ' + i.dir + (i.keys ? ' [' + i.keys.join(',') + ']' : ''));
  process.exit(1);
}
