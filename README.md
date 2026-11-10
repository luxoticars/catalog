# @luxoticars/catalog

Shared vehicle catalog for the Luxoticars apps: record types, the helpers that turn records into
Year → Brand → Model → Variant choices, a validator, and a read-only KV reader.

| Consumer | Role |
|---|---|
| `luxoticars-dash` | Writes the catalog (admin forms) and reads it for the listing form |
| `luxoticars-vi`, `luxoticars-srp` | Read-only |

The data lives in one Cloudflare KV namespace; this package is the contract for what is in it.

## KV layout

| Key | Value |
|---|---|
| `catalog:meta` | `{ schemaVersion, updatedAt }` |
| `catalog:{kind}:makes` | `{ make, years[] }[]`: which makes have which years |
| `catalog:{kind}:make:{slug}` | every record for one make (`slug` = lowercase, letters and digits only) |

`kind` is `car | motorbike | scooter | boat | watch`. Only `car` has data today. A read of models or specs is a
single `get`. Makes and models that differ only by case or punctuation (`HONDA`/`Honda`, `Supra`/`SUPRA`)
are one option; the first spelling seen is displayed.

## Use

```ts
import { createCatalogReader } from "@luxoticars/catalog";

const catalog = createCatalogReader(env.CAR_CATALOG); // a KVNamespace
await catalog.getMakes(2024);
await catalog.getModels(2024, "Toyota");
await catalog.getSpecs(2024, "Toyota", "Supra");
```

A missing key is "no data" and returns `[]`. A malformed value throws `CatalogFormatError`.

## Engines and powertrains

Dealers entered engine size as cc (`"1998"`) and litres (`"1.5"`) interchangeably. `parseEngineCc` normalises both to
`engineCc`; `formatEngineLabel` renders `2.0L (1,998 cc)` or, for an EV, `75 kWh`. The original `engine` string is kept
because existing listings store it. EVs use `propulsion: "ev"` with `batteryKwh`, `motorKw`, a `range` that names its test cycle,
and `charging` connectors (Malaysia: AC Type 2, DC CCS2).

## Compatibility rules

- Changes are **additive**: new optional fields only. A reader ignores fields it does not know, and `parseCarRecord`
  passes them through, so reading a blob and writing it back never strips a newer field.
- `SCHEMA_VERSION` bumps only for a breaking change. `assertCompatible(meta)` makes an old consumer fail loudly
  instead of misreading newer data.
- Consumers pin a **tag**, not a commit: `"@luxoticars/catalog": "git+https://github.com/luxoticars/catalog.git#v0.1.0"`.
  The `prepare` script builds `dist/` on install. pnpm skips dependency scripts by default, so each consumer must approve
  the package in `pnpm-workspace.yaml`, or the install fails with `ERR_PNPM_IGNORED_BUILDS` / leaves no `dist/` and the
  import fails.

  **Latest stable pnpm (v11+, currently 12.x)** uses `allowBuilds`. For a git-hosted dependency a bare package name is
  not enough; approve it by repository URL (no `#<tag>` suffix, so tag bumps need no re-approval; the URL must match the
  one in `package.json` exactly):

  ```yaml
  allowBuilds:
    "@luxoticars/catalog@git+https://github.com/luxoticars/catalog.git": true
  ```

  Alternatively run `pnpm approve-builds` after installing, or `pnpm install --allow-build=@luxoticars/catalog`; both
  write the entry for you.

  **pnpm 10** (the version this repo pins) still uses the older setting, which `allowBuilds` replaced in v11
  (`pnpx codemod run pnpm-v10-to-v11` migrates it):

  ```yaml
  onlyBuiltDependencies:
    - "@luxoticars/catalog"
  ```

## Develop

```sh
pnpm install
pnpm run typecheck && pnpm test && pnpm run build
```
