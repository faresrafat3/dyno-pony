#!/usr/bin/env node
// counts.cjs — the ONE place where dyno-pony's headline counts are derived.
//
// Why this exists (2026-09-21): rebuild.sh had been stating "34 tools / 10
// skills / 4 presets" for months after the merge took the arsenal to 38 tools
// and 14 skills. Nothing checked it, so the script kept teaching the next agent
// a false count (E6: counters are derived, never hardcoded — E1: the entry
// point tells the truth or it does not exist).
//
// Every number here comes from a file or a directory, never from this file:
//   tools        mounted from packages/dyno-pony.js with a fake host
//   sections     the `// <name> (<n> tools)` markers the merger writes
//   sources      the ORDER manifest in scripts/merge-plugins.cjs
//   plugins      package files that are NOT in ORDER (i.e. the merged bundle)
//   skills       directories in dynamic-skills/
//   presets      directories in ~/.agent-presets (0 when not installed)
//
// Usage:
//   node scripts/counts.cjs            # JSON
//   node scripts/counts.cjs --shell    # KEY=value lines, safe to `eval`
//
// tests/preflight.test.cjs cross-checks this module against its own mounted
// bundle, so a lie in here fails the gate rather than reaching a document.

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PKG_DIR = path.join(ROOT, 'packages');
const BUNDLE = path.join(PKG_DIR, 'dyno-pony.js');
const MERGER = path.join(__dirname, 'merge-plugins.cjs');
const SKILLS_DIR = path.join(ROOT, 'dynamic-skills');
const PRESET_DIR = process.env.DSH_AGENT_PRESETS || path.join(process.env.HOME || '', '.agent-presets');

function dirsIn(dir) {
  if (!dir || !fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((d) => {
      try {
        return fs.statSync(path.join(dir, d)).isDirectory();
      } catch (_e) {
        return false;
      }
    })
    .sort();
}

// The merger's ORDER array is the manifest of what gets merged. Line comments
// are stripped first so a quoted ".js" in a comment cannot be mistaken for a
// source (the v1.1/v1.2 markers live inside that array).
function sourceFiles() {
  const body = fs.readFileSync(MERGER, 'utf8');
  const block = body.match(/const ORDER = \[([\s\S]*?)\];/);
  if (!block) throw new Error('counts: no ORDER manifest in scripts/merge-plugins.cjs');
  const cleaned = block[1]
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n');
  return [...cleaned.matchAll(/'([a-zA-Z0-9._-]+\.js)'/g)].map((m) => m[1]);
}

// The merger stamps `// <name> (<n> tools)` above every section it emits.
function sectionMarkers() {
  const body = fs.readFileSync(BUNDLE, 'utf8');
  const out = [];
  const re = /^ +\/\/ ([a-z][a-z0-9_-]*) \(([0-9]+) tools?\)$/gm;
  let m;
  while ((m = re.exec(body)) !== null) out.push({ name: m[1], tools: Number(m[2]) });
  return out;
}

// Ground truth: how many tools does the model actually see? Mount the bundle
// exactly the way the host does (same fakes as tests/preflight.test.cjs).
function mountedTools() {
  const body = fs.readFileSync(BUNDLE, 'utf8');
  const names = [];
  const harness = {
    defineTool: (def) => {
      names.push(def && def.name);
      return def;
    },
    registerTool: () => () => {},
    handle: () => () => {},
  };
  const ctx = {
    get: () => undefined,
    on: () => () => {},
    provide: () => () => {},
    effect: (cb) => {
      try {
        const disposer = cb();
        return typeof disposer === 'function' ? disposer : () => {};
      } catch (_e) {
        return () => {};
      }
    },
  };
  // A silent console: the sources announce every registration, and those logs
  // must not reach stdout (the --shell mode is fed to `eval`).
  const silent = { log() {}, info() {}, warn() {}, error() {}, debug() {} };
  const plugin = new Function('harness', 'ctx', 'console', body)(harness, ctx, silent);
  if (!plugin || typeof plugin.apply !== 'function') {
    throw new Error('counts: packages/dyno-pony.js did not return { apply }');
  }
  plugin.apply(ctx);
  return names;
}

function compute() {
  const sources = sourceFiles();
  const packageFiles = fs.readdirSync(PKG_DIR).filter((f) => f.endsWith('.js'));
  const sections = sectionMarkers();
  const bundle = fs.statSync(BUNDLE);
  const bundleBody = fs.readFileSync(BUNDLE, 'utf8');

  return {
    tools: mountedTools().length,
    plugins: packageFiles.filter((f) => !sources.includes(f)).length,
    sources: sources.length,
    sourcesPresent: sources.filter((f) => fs.existsSync(path.join(PKG_DIR, f))).length,
    sourceFiles: sources,
    packageFiles: packageFiles.length,
    skills: dirsIn(SKILLS_DIR).length,
    skillDirs: dirsIn(SKILLS_DIR),
    presets: dirsIn(PRESET_DIR).length,
    presetDir: PRESET_DIR,
    sections,
    sectionTools: sections.reduce((n, s) => n + s.tools, 0),
    bundleBytes: bundle.size,
    bundleKB: Math.round(bundle.size / 1024),
    bundleLines: bundleBody.split('\n').length,
  };
}

function shellQuote(value) {
  return "'" + String(value).replace(/'/g, "'\\''") + "'";
}

module.exports = { compute };

if (require.main === module) {
  const c = compute();
  if (process.argv.includes('--shell')) {
    process.stdout.write(
      [
        `TOOLS=${c.tools}`,
        `PLUGINS=${c.plugins}`,
        `SOURCES=${c.sources}`,
        `SKILLS=${c.skills}`,
        `PRESETS=${c.presets}`,
        `BUNDLE_KB=${c.bundleKB}`,
        `BUNDLE_LINES=${c.bundleLines}`,
        `PRESET_DIR=${shellQuote(c.presetDir)}`,
        `SECTIONS=${shellQuote(c.sections.map((s) => `${s.name}:${s.tools}`).join(' '))}`,
      ].join('\n') + '\n',
    );
  } else {
    process.stdout.write(JSON.stringify(c, null, 2) + '\n');
  }
}
