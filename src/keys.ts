import { slug } from "./slug.js";
import type { VehicleKind } from "./types.js";

/** Bump only for a breaking change to stored shapes. Additive fields never bump it. */
export const SCHEMA_VERSION = 1;

/** KV key layout. One records blob per make keeps every read to a single `get`. */
export const keys = {
  meta: "catalog:meta",
  makes: (kind: VehicleKind) => `catalog:${kind}:makes`,
  records: (kind: VehicleKind, make: string) => `catalog:${kind}:make:${slug(make)}`,
} as const;
