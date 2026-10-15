import { describe, expect, it } from "vitest";
import { formatEngineLabel, parseEngineCc, propulsionFromFuelType } from "../src/index.js";

describe("parseEngineCc", () => {
  it("keeps cc values", () => {
    expect(parseEngineCc("1998")).toBe(1998);
    expect(parseEngineCc(2993)).toBe(2993);
  });
  it("converts litres to cc", () => {
    expect(parseEngineCc("1.5")).toBe(1500);
    expect(parseEngineCc("4.0")).toBe(4000);
    expect(parseEngineCc("3")).toBe(3000);
    expect(parseEngineCc("6.75")).toBe(6750);
    expect(parseEngineCc("2.0L")).toBe(2000);
    expect(parseEngineCc("1998 cc")).toBe(1998);
  });
  it("returns null for empty, zero and ambiguous input", () => {
    expect(parseEngineCc("")).toBeNull();
    expect(parseEngineCc(null)).toBeNull();
    expect(parseEngineCc("0")).toBeNull();
    expect(parseEngineCc("50")).toBeNull();
    expect(parseEngineCc("n/a")).toBeNull();
  });
});

describe("propulsionFromFuelType", () => {
  it("maps the seed's legacy values", () => {
    expect(propulsionFromFuelType("PETROL")).toBe("ice");
    expect(propulsionFromFuelType("diesel")).toBe("ice");
    expect(propulsionFromFuelType("ELECTRIC")).toBe("ev");
    expect(propulsionFromFuelType("unknown")).toBeUndefined();
    expect(propulsionFromFuelType(undefined)).toBeUndefined();
  });
});

describe("formatEngineLabel", () => {
  it("shows litres and cc for combustion engines", () => {
    expect(formatEngineLabel({ engine: "1998" })).toBe("2.0L (1,998 cc)");
    expect(formatEngineLabel({ engine: "1.5" })).toBe("1.5L (1,500 cc)");
    expect(formatEngineLabel({ engine: "6.75" })).toBe("6.75L (6,750 cc)");
  });
  it("shows battery capacity for EVs and tolerates a missing one", () => {
    expect(formatEngineLabel({ engine: "0", propulsion: "ev", batteryKwh: 75 })).toBe("75 kWh");
    expect(formatEngineLabel({ engine: "0", propulsion: "ev" })).toBe("Electric");
  });
  it("falls back to the original text", () => {
    expect(formatEngineLabel({ engine: "V8 twin-turbo" })).toBe("V8 twin-turbo");
  });
});
