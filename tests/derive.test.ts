import { describe, expect, it } from "vitest";
import { buildMakesIndex, deriveMakes, deriveModels, deriveSpecs, deriveYears, makesForYear, type CarRecord } from "../src/index.js";

function row(p: Partial<CarRecord> & Pick<CarRecord, "year" | "make" | "model">): CarRecord {
  return {
    title: "", series: "", assembly: "", variant: "", variant_facet: "", pricing_variant: "", bodyType: "",
    engine: "", transmission: "", driveWheel: "", extraInfo: null, ...p,
  };
}

const records: CarRecord[] = [
  row({ year: 2024, make: "Honda", model: "Civic", variant: "RS", engine: "1498", transmission: "CVT", fuelType: "PETROL" }),
  row({ year: 2024, make: "HONDA", model: "CIVIC", variant: "Type R", engine: "1996", transmission: "6 SP MANUAL" }),
  row({ year: 2024, make: "Toyota", model: "Supra", variant: "RZ", engine: "3.0", transmission: "AUTO" }),
  row({ year: 2024, make: "Toyota", model: "SUPRA", variant: "RZ 3.0L", engine: "3.0", transmission: "AUTO" }),
  row({ year: 2023, make: "Tesla", model: "Model 3", variant: "RWD", engine: "0", transmission: "1 SP", fuelType: "ELECTRIC" }),
];

describe("derive helpers", () => {
  it("lists years newest first", () => {
    expect(deriveYears(records)).toEqual([2024, 2023]);
  });
  it("merges makes and models that differ only by case", () => {
    expect(deriveMakes(records, 2024)).toEqual(["Honda", "Toyota"]);
    expect(deriveModels(records, 2024, "honda")).toEqual(["Civic"]);
    expect(deriveModels(records, 2024, "Toyota")).toEqual(["Supra"]);
  });
  it("finds specs across spellings of the same model", () => {
    expect(deriveSpecs(records, 2024, "Toyota", "Supra").map((s) => s.variant)).toEqual(["RZ", "RZ 3.0L"]);
    expect(deriveSpecs(records, 2024, "HONDA", "Civic")).toHaveLength(2);
  });
  it("adds normalised engine fields to specs", () => {
    const supra = deriveSpecs(records, 2024, "Toyota", "Supra")[0]!;
    expect(supra.engineCc).toBe(3000);
    const model3 = deriveSpecs(records, 2023, "Tesla", "Model 3")[0]!;
    expect(model3.propulsion).toBe("ev");
    expect(model3.engineCc).toBeUndefined();
  });
  it("returns nothing for unknown combinations", () => {
    expect(deriveModels(records, 2024, "Nope")).toEqual([]);
    expect(deriveSpecs(records, 1990, "Honda", "Civic")).toEqual([]);
  });
});

describe("makes index", () => {
  it("collapses spellings and lists years newest first", () => {
    const index = buildMakesIndex(records);
    expect(index.map((e) => e.make)).toEqual(["Honda", "Tesla", "Toyota"]);
    expect(index.find((e) => e.make === "Tesla")?.years).toEqual([2023]);
  });
  it("answers which makes have a year", () => {
    const index = buildMakesIndex(records);
    expect(makesForYear(index, 2024)).toEqual(["Honda", "Toyota"]);
    expect(makesForYear(index, 2023)).toEqual(["Tesla"]);
    expect(makesForYear(index, 1999)).toEqual([]);
  });
});

describe("deriveSpecs de-duplication", () => {
  it("collapses exact repeats only", () => {
    const base = row({ year: 2024, make: "Kia", model: "Sorento", variant: "GT", engine: "2151", transmission: "8 SP", driveWheel: "AWD" });
    expect(deriveSpecs([base, { ...base }], 2024, "Kia", "Sorento")).toHaveLength(1);
  });
  it("keeps rows that differ in drive wheel or assembly", () => {
    const base = row({ year: 2024, make: "Kia", model: "Sorento", variant: "GT", engine: "2151", transmission: "8 SP", driveWheel: "AWD", assembly: "Local" });
    const specs = deriveSpecs([base, { ...base, driveWheel: "FWD" }, { ...base, assembly: "Imported" }], 2024, "Kia", "Sorento");
    expect(specs.map((s) => `${s.driveWheel}/${s.assembly}`)).toEqual(["AWD/Local", "FWD/Local", "AWD/Imported"]);
  });
});
