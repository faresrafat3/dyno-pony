# dyno-pony tests

The gate is `npm test` (see `PROTECTED.md`); it builds the generated bundle
first. `tests/preflight.test.cjs` is the oracle: it mounts the bundle with a
fake host and checks the tool set, schemas, counts and doc agreement.

The fake host does not exercise real DSH services (`ctx.fs`,
`ctx.workflowEngine`, `ctx.sessions`); those are covered by the host's own
suite and a live smoke test. Counts are measured by `scripts/suite-count.cjs`,
never written here.
