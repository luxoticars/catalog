# Changesets

Every PR that changes the package (anything under `src/`, or a behaviour/type change) adds a changeset:

```sh
pnpm changeset
```

Pick `patch` (fix), `minor` (new optional field/helper) or `major` (breaking: also bump `SCHEMA_VERSION`; see CLAUDE.md).
Docs/CI-only PRs need no changeset.

On merge to `main` the release workflow opens a "Version Packages" PR. Merging it tags `vX.Y.Z` and creates a GitHub release.
