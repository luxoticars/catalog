import { describe, expect, it } from "vitest";
import { CAR_TYPES, CAR_TYPE_LABELS, bodyTypeToCarType, isCarType, parseCarRecord, resolveCarType } from "../src/index.js";

describe("bodyTypeToCarType", () => {
  it.each([
    ["MPV", "mpv"], ["4D MINI VAN", "mpv"],
    ["4D SUV", "suv"], ["4X4", "suv"],
    ["Sedan", "sedan"], ["4D HATCHBACK", "hatchback"],
    ["2D COUPE", "coupe"], ["2 DOOR COUPE", "coupe"],
    ["Pick-up", "pickup"], ["4D DOUBLE CAB PICK-UP", "pickup"], ["SINGLE CAB P/UP", "pickup"],
    ["Sports", "sports"], ["2D SPORT", "sports"],
    ["4D WAGON", "wagon"], ["Estate", "wagon"],
    ["2D CONVERTIBLE", "convertible"], ["2D CABRIO", "convertible"], ["4D SOFTTOP", "convertible"],
    ["2D ROADSTER", "convertible"], ["2D ROADSTER CONVERTIBLE", "convertible"],
  ] as const)("%s → %s", (body, type) => {
    expect(bodyTypeToCarType(body)).toBe(type);
  });
  it("falls back to other, and null for empty", () => {
    expect(bodyTypeToCarType("Limousine")).toBe("other");
    expect(bodyTypeToCarType("")).toBeNull();
    expect(bodyTypeToCarType(null)).toBeNull();
  });
  it("never answers a class: that needs a curated carType", () => {
    for (const body of ["Supercar", "Hypercar", "Sportcar", "Sport Touring", "2D COUPE"]) {
      expect(["sportcar", "sport-touring", "supercar", "hypercar"]).not.toContain(bodyTypeToCarType(body));
    }
  });
});

describe("resolveCarType", () => {
  it("prefers the curated carType over the body style", () => {
    expect(resolveCarType({ carType: "supercar", bodyType: "2D COUPE" })).toBe("supercar");
    expect(resolveCarType({ bodyType: "2D COUPE" })).toBe("coupe");
    expect(resolveCarType({ bodyType: "" })).toBeNull();
  });
});

describe("car type vocabulary", () => {
  it("labels every type", () => {
    expect(Object.keys(CAR_TYPE_LABELS).sort()).toEqual([...CAR_TYPES].sort());
  });
  it("recognises only listed values", () => {
    expect(isCarType("hypercar")).toBe(true);
    expect(isCarType("sport-touring")).toBe(true);
    expect(CAR_TYPE_LABELS["sport-touring"]).toBe("Sport Touring (Supercar)");
    expect(isCarType("spaceship")).toBe(false);
    expect(isCarType(undefined)).toBe(false);
  });
  it("rejects a record with an unknown carType and keeps a known one", () => {
    const base = {
      title: "", year: 2024, make: "Ferrari", model: "296", series: "", assembly: "", variant: "GTB",
      variant_facet: "", pricing_variant: "", bodyType: "2D COUPE", engine: "2992", transmission: "8 SP DCT",
      driveWheel: "RWD", extraInfo: null,
    };
    expect(parseCarRecord({ ...base, carType: "supercar" }).carType).toBe("supercar");
    expect(() => parseCarRecord({ ...base, carType: "spaceship" })).toThrow(/carType/);
  });
});
