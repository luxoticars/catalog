import { parseEngineCc, propulsionFromFuelType } from "./engine.js";
import { slug } from "./slug.js";
import type { CarRecord, CatalogSpec, MakesIndexEntry } from "./types.js";

type Row = Pick<CarRecord, "year" | "make" | "model">;

/** Sorted, de-duplicated by slug; the first spelling seen is the one shown. */
function uniqueSorted(values: string[]): string[] {
  const seen = new Map<string, string>();
  for (const v of values) {
    const key = slug(v);
    if (key && !seen.has(key)) seen.set(key, v);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

export function deriveYears(records: readonly Row[]): number[] {
  return [...new Set(records.map((r) => r.year))].filter(Number.isFinite).sort((a, b) => b - a);
}

export function deriveMakes(records: readonly Row[], year: number): string[] {
  return uniqueSorted(records.filter((r) => r.year === year).map((r) => r.make));
}

export function deriveModels(records: readonly Row[], year: number, make: string): string[] {
  const m = slug(make);
  return uniqueSorted(records.filter((r) => r.year === year && slug(r.make) === m).map((r) => r.model));
}

/** Every variant row for a year + make + model, reduced to what the form needs. */
export function deriveSpecs(records: readonly CarRecord[], year: number, make: string, model: string): CatalogSpec[] {
  const m = slug(make);
  const md = slug(model);
  const seen = new Set<string>();
  const out: CatalogSpec[] = [];
  for (const r of records) {
    if (r.year !== year || slug(r.make) !== m || slug(r.model) !== md) continue;
    const propulsion = r.propulsion ?? propulsionFromFuelType(r.fuelType);
    const engineCc = r.engineCc ?? parseEngineCc(r.engine);
    const spec: CatalogSpec = {
      variant: r.variant,
      transmission: r.transmission,
      engine: r.engine,
      driveWheel: r.driveWheel,
      assembly: r.assembly,
      bodyType: r.bodyType,
      ...(r.fuelType !== undefined && { fuelType: r.fuelType }),
      ...(propulsion && { propulsion }),
      ...(engineCc && { engineCc }),
      ...(r.batteryKwh !== undefined && { batteryKwh: r.batteryKwh }),
      ...(r.motorKw !== undefined && { motorKw: r.motorKw }),
      ...(r.range && { range: r.range }),
      ...(r.charging && { charging: r.charging }),
    };
    // Only exact repeats collapse: rows that differ in drive wheel, assembly, body or powertrain are distinct specs.
    const key = JSON.stringify(spec);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(spec);
  }
  return out;
}

/** Builds the per-kind index from a full record list (used when seeding and after admin edits). */
export function buildMakesIndex(records: readonly Row[]): MakesIndexEntry[] {
  const byMake = new Map<string, MakesIndexEntry>();
  for (const r of records) {
    const key = slug(r.make);
    if (!key) continue;
    const entry = byMake.get(key) ?? { make: r.make, years: [] };
    if (!entry.years.includes(r.year)) entry.years.push(r.year);
    byMake.set(key, entry);
  }
  return [...byMake.values()]
    .map((e) => ({ make: e.make, years: e.years.sort((a, b) => b - a) }))
    .sort((a, b) => a.make.localeCompare(b.make));
}

/** Makes that have at least one record in `year`, read from the index. */
export function makesForYear(index: readonly MakesIndexEntry[], year: number): string[] {
  return index.filter((e) => e.years.includes(year)).map((e) => e.make).sort((a, b) => a.localeCompare(b));
}
