import { describe, expect, it } from "vitest";
import {
  assertCompatible, CatalogFormatError, createCatalogReader, keys, parseCarRecord, SCHEMA_VERSION,
  type CarRecord, type KvJsonReader,
} from "../src/index.js";

const civic: CarRecord = {
  title: "", year: 2024, make: "Honda", model: "Civic", series: "", assembly: "", variant: "RS",
  variant_facet: "", pricing_variant: "", bodyType: "", engine: "1498", transmission: "CVT",
  driveWheel: "", extraInfo: null,
};

function fakeKv(data: Record<string, unknown>): KvJsonReader {
  return { get: async (key) => data[key] ?? null };
}

describe("createCatalogReader", () => {
  const kv = fakeKv({
    [keys.makes("car")]: [{ make: "Honda", years: [2024] }],
    [keys.records("car", "Honda")]: [civic],
  });
  const reader = createCatalogReader(kv);

  it("reads makes from the index", async () => {
    expect(await reader.getMakes(2024)).toEqual(["Honda"]);
    expect(await reader.getMakes(2000)).toEqual([]);
  });
  it("reads models and specs from one make's blob, regardless of spelling", async () => {
    expect(await reader.getModels(2024, "HONDA")).toEqual(["Civic"]);
    expect((await reader.getSpecs(2024, "honda", "civic"))[0]?.engineCc).toBe(1498);
  });
  it("treats a missing key as no data", async () => {
    expect(await reader.getModels(2024, "Nope")).toEqual([]);
    expect(await reader.getSpecs(2024, "Nope", "X")).toEqual([]);
    expect(await reader.getMeta()).toBeNull();
  });
  it("throws on a malformed blob instead of returning an empty list", async () => {
    const bad = createCatalogReader(fakeKv({ [keys.records("car", "Honda")]: [{ year: "2024" }] }));
    await expect(bad.getModels(2024, "Honda")).rejects.toBeInstanceOf(CatalogFormatError);
  });
});

describe("parseCarRecord", () => {
  it("keeps fields it does not know about", () => {
    const r = parseCarRecord({ ...civic, futureField: { a: 1 } });
    expect((r as unknown as Record<string, unknown>).futureField).toEqual({ a: 1 });
  });
  it("rejects bad shapes", () => {
    expect(() => parseCarRecord({ ...civic, year: 1500 })).toThrow(CatalogFormatError);
    expect(() => parseCarRecord({ ...civic, make: "" })).toThrow(CatalogFormatError);
    expect(() => parseCarRecord({ ...civic, engineCc: -1 })).toThrow(CatalogFormatError);
    expect(() => parseCarRecord("x")).toThrow(CatalogFormatError);
  });
  it("validates the powertrain fields it knows", () => {
    const ok = { ...civic, propulsion: "ev", range: { value: 500, cycle: "WLTP" }, charging: { ac: "type2", dc: "ccs2", maxDcKw: 150 } };
    expect(() => parseCarRecord(ok)).not.toThrow();
    expect(() => parseCarRecord({ ...ok, propulsion: "steam" })).toThrow(CatalogFormatError);
    expect(() => parseCarRecord({ ...ok, range: { value: "500", cycle: "WLTP" } })).toThrow(CatalogFormatError);
    expect(() => parseCarRecord({ ...ok, range: { value: 500, cycle: "invalid" } })).toThrow(CatalogFormatError);
    expect(() => parseCarRecord({ ...ok, range: { value: 500 } })).toThrow(CatalogFormatError);
    expect(() => parseCarRecord({ ...ok, range: 5 })).toThrow(CatalogFormatError);
    expect(() => parseCarRecord({ ...ok, charging: "ccs2" })).toThrow(CatalogFormatError);
    expect(() => parseCarRecord({ ...ok, charging: { dc: "usb" } })).toThrow(CatalogFormatError);
    expect(() => parseCarRecord({ ...ok, fuelType: 7 })).toThrow(CatalogFormatError);
  });
});

describe("assertCompatible", () => {
  it("accepts the current and older schema, rejects a newer one", () => {
    expect(() => assertCompatible({ schemaVersion: SCHEMA_VERSION, updatedAt: "" })).not.toThrow();
    expect(() => assertCompatible({ schemaVersion: SCHEMA_VERSION + 1, updatedAt: "" })).toThrow(/upgrade/);
  });
});

describe("keys", () => {
  it("slugs the make so spellings share a key", () => {
    expect(keys.records("car", "Mercedes Benz")).toBe(keys.records("car", "MERCEDES-BENZ"));
    expect(keys.makes("motorbike")).toBe("catalog:motorbike:makes");
  });
});
