import { deriveModels, deriveSpecs, makesForYear } from "./derive.js";
import { keys } from "./keys.js";
import type { CatalogMeta, CatalogSpec, VehicleKind } from "./types.js";
import { parseCarRecords, parseMakesIndex, parseMeta } from "./validate.js";

/** The one method of a Cloudflare `KVNamespace` the reader needs. */
export interface KvJsonReader {
  get(key: string, type: "json"): Promise<unknown>;
}

/**
 * Read-only access for the apps that consume the catalog. A missing key is
 * "no data" and returns an empty list; a present but malformed value throws, so a
 * corrupt blob surfaces as an error instead of an empty dropdown.
 */
export function createCatalogReader(kv: KvJsonReader, kind: VehicleKind = "car") {
  return {
    async getMeta(): Promise<CatalogMeta | null> {
      const raw = await kv.get(keys.meta, "json");
      return raw == null ? null : parseMeta(raw);
    },
    async getMakes(year: number): Promise<string[]> {
      const raw = await kv.get(keys.makes(kind), "json");
      return raw == null ? [] : makesForYear(parseMakesIndex(raw), year);
    },
    async getModels(year: number, make: string): Promise<string[]> {
      const raw = await kv.get(keys.records(kind, make), "json");
      return raw == null ? [] : deriveModels(parseCarRecords(raw), year, make);
    },
    async getSpecs(year: number, make: string, model: string): Promise<CatalogSpec[]> {
      const raw = await kv.get(keys.records(kind, make), "json");
      return raw == null ? [] : deriveSpecs(parseCarRecords(raw), year, make, model);
    },
  };
}
