/**
 * The fixed `car_type` vocabulary every app stores and filters on. One combined field: a body style
 * (coupe, wagon…) or, where it matters more to a buyer, a class (supercar, hypercar).
 * Additive only: consumers validate against this list, so a value is never renamed or removed.
 */
export const CAR_TYPES = [
  "coupe",
  "sedan",
  "hatchback",
  "wagon",
  "convertible",
  "suv",
  "mpv",
  "pickup",
  "sports",
  "supercar",
  "hypercar",
  "other",
] as const;

export type CarType = (typeof CAR_TYPES)[number];

export const CAR_TYPE_LABELS: Record<CarType, string> = {
  coupe: "Coupe",
  sedan: "Sedan",
  hatchback: "Hatchback",
  wagon: "Wagon",
  convertible: "Convertible",
  suv: "SUV",
  mpv: "MPV",
  pickup: "Pickup",
  sports: "Sports",
  supercar: "Supercar",
  hypercar: "Hypercar",
  other: "Other",
};

export function isCarType(value: unknown): value is CarType {
  return typeof value === "string" && (CAR_TYPES as readonly string[]).includes(value);
}

const has = (v: string, ...needles: string[]) => needles.some((n) => v.includes(n));

/**
 * Maps a catalog row's free-form `bodyType` ("MPV", "4D SUV", "2D CABRIO") onto `CarType`.
 * Body style only: it never answers supercar or hypercar. That is the record's curated `carType`.
 */
export function bodyTypeToCarType(bodyType: string | null | undefined): CarType | null {
  const v = (bodyType ?? "").trim().toLowerCase();
  if (!v) return null;
  // Open tops first: "2D ROADSTER CONVERTIBLE" and "coupé cabriolet" are convertibles.
  if (has(v, "convertible", "cabrio", "softtop", "soft top", "roadster", "spyder", "spider", "volante")) return "convertible";
  if (has(v, "coupe", "coupé")) return "coupe";
  if (has(v, "hatch")) return "hatchback";
  if (has(v, "wagon", "estate", "touring", "shooting brake")) return "wagon";
  if (has(v, "mpv", "van", "people")) return "mpv";
  if (has(v, "pick", "p/up", "truck")) return "pickup";
  if (has(v, "suv", "crossover", "4x4", "sport utility", "sports utility")) return "suv";
  if (has(v, "sport")) return "sports";
  if (has(v, "sedan", "saloon")) return "sedan";
  return "other";
}

/** A row's car type: the curated `carType` when the catalog sets one, otherwise its body style. */
export function resolveCarType(row: { carType?: CarType; bodyType?: string | null }): CarType | null {
  return row.carType ?? bodyTypeToCarType(row.bodyType);
}
