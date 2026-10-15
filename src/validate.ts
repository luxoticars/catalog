import { SCHEMA_VERSION } from "./keys.js";
import type { CarRecord, CatalogMeta, MakesIndexEntry } from "./types.js";

export class CatalogFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogFormatError";
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function str(o: Record<string, unknown>, field: string, where: string): string {
  const v = o[field];
  if (typeof v !== "string") throw new CatalogFormatError(`${where}: "${field}" must be a string`);
  return v;
}

function optNumber(o: Record<string, unknown>, field: string, where: string): void {
  const v = o[field];
  if (v !== undefined && (typeof v !== "number" || !Number.isFinite(v) || v < 0)) {
    throw new CatalogFormatError(`${where}: "${field}" must be a non-negative number`);
  }
}

/**
 * Checks the fields every consumer depends on and passes everything else
 * through untouched, so a reader on an older package never strips a newer field
 * when a blob is read and written back.
 */
export function parseCarRecord(input: unknown, where = "record"): CarRecord {
  if (!isObject(input)) throw new CatalogFormatError(`${where}: must be an object`);
  const year = input.year;
  if (typeof year !== "number" || !Number.isInteger(year) || year < 1886 || year > 2200) {
    throw new CatalogFormatError(`${where}: "year" must be an integer year`);
  }
  for (const f of ["make", "model", "variant", "transmission", "engine", "driveWheel", "assembly", "bodyType"]) {
    str(input, f, where);
  }
  if (!input.make || !input.model) throw new CatalogFormatError(`${where}: "make" and "model" must not be empty`);
  for (const f of ["engineCc", "batteryKwh", "motorKw"]) optNumber(input, f, where);
  return input as unknown as CarRecord;
}

export function parseCarRecords(input: unknown): CarRecord[] {
  if (!Array.isArray(input)) throw new CatalogFormatError("records: must be an array");
  return input.map((r, i) => parseCarRecord(r, `records[${i}]`));
}

export function parseMakesIndex(input: unknown): MakesIndexEntry[] {
  if (!Array.isArray(input)) throw new CatalogFormatError("makes index: must be an array");
  return input.map((e, i) => {
    const where = `makes[${i}]`;
    if (!isObject(e)) throw new CatalogFormatError(`${where}: must be an object`);
    const make = str(e, "make", where);
    if (!Array.isArray(e.years) || !e.years.every((y) => typeof y === "number" && Number.isInteger(y))) {
      throw new CatalogFormatError(`${where}: "years" must be an array of integers`);
    }
    return { make, years: e.years as number[] };
  });
}

export function parseMeta(input: unknown): CatalogMeta {
  if (!isObject(input) || typeof input.schemaVersion !== "number" || typeof input.updatedAt !== "string") {
    throw new CatalogFormatError("meta: expected { schemaVersion, updatedAt }");
  }
  return { schemaVersion: input.schemaVersion, updatedAt: input.updatedAt };
}

/** Throws when KV holds a newer schema than this package understands. */
export function assertCompatible(meta: CatalogMeta): void {
  if (meta.schemaVersion > SCHEMA_VERSION) {
    throw new CatalogFormatError(
      `catalog schema ${meta.schemaVersion} is newer than this package supports (${SCHEMA_VERSION}); upgrade @luxoticars/catalog`,
    );
  }
}
