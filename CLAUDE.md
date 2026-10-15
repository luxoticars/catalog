# CLAUDE.md

`@luxoticars/catalog`: shared types, helpers, validator and read-only KV reader for the catalog that
`luxoticars-dash` writes and `luxoticars-vi` / `luxoticars-srp` read. See `README.md` for the KV layout.

- **Zero runtime dependencies.** Keep `dependencies` empty; this ships into Workers bundles.
- **Additive changes only.** New optional fields; never rename or remove a stored field. A breaking change bumps
  `SCHEMA_VERSION` and needs a migration plan across all three consumers first.
- **Never strip unknown fields** when reading a record that may be written back (`parseCarRecord` passes them through).
- **Relative imports end in `.js`** (NodeNext). `dist/` is built by `prepare` on install and is not committed.
- **Release by tag** (`vX.Y.Z`, matching `package.json`). Consumers pin tags.
- Checks before pushing: `pnpm run typecheck && pnpm test && pnpm run build`.
- Writes to the catalog live in `luxoticars-dash`, not here, so this package stays safe to import from read-only apps.
