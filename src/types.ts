/** What a record describes. Only `car` has data today; the rest reserve key space. */
export type VehicleKind = "car" | "motorbike" | "scooter" | "boat" | "watch";

export type Propulsion = "ice" | "hybrid" | "phev" | "ev";

/** Range figures differ by tens of percent between test cycles, so a value always names its cycle. */
export type RangeCycle = "WLTP" | "NEDC" | "CLTC" | "EPA" | "JC08";
export type AcConnector = "type2" | "type1";
export type DcConnector = "ccs2" | "chademo" | "gbt" | "nacs";

export interface Range {
  value: number;
  cycle: RangeCycle;
}

export interface Charging {
  ac?: AcConnector;
  dc?: DcConnector;
  maxDcKw?: number;
}

/**
 * Powertrain facts shared by a full record and the slice the form reads.
 * `engine` is required; every other field is optional so existing rows stay valid,
 * and new fields are additive only.
 */
export interface Powertrain {
  /** Original free-text engine value as dealers and legacy rows entered it ("1998", "1.5"). */
  engine: string;
  /** Legacy free text ("PETROL", "DIESEL", "ELECTRIC"). Prefer `propulsion`. */
  fuelType?: string;
  propulsion?: Propulsion;
  /** Displacement in cubic centimetres. */
  engineCc?: number;
  batteryKwh?: number;
  motorKw?: number;
  range?: Range;
  charging?: Charging;
}

/** One denormalised row per real-world variant. */
export interface CarRecord extends Powertrain {
  title: string;
  year: number;
  make: string;
  model: string;
  series: string;
  assembly: string;
  variant: string;
  variant_facet: string;
  pricing_variant: string;
  bodyType: string;
  transmission: string;
  driveWheel: string;
  extraInfo: string | null;
}

/** A record reduced to what the form's last selects need. */
export interface CatalogSpec extends Powertrain {
  variant: string;
  transmission: string;
  driveWheel: string;
  assembly: string;
  bodyType: string;
}

/** One entry of the small per-kind index that answers "which makes have this year". */
export interface MakesIndexEntry {
  make: string;
  years: number[];
}

export interface CatalogMeta {
  schemaVersion: number;
  updatedAt: string;
}
