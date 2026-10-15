import { describe, expect, it } from "vitest";
import { bodyTypeToCarType } from "../src/index.js";

describe("bodyTypeToCarType", () => {
  it("maps common body types", () => {
    expect(bodyTypeToCarType("MPV")).toBe("mpv");
    expect(bodyTypeToCarType("4D SUV")).toBe("suv");
    expect(bodyTypeToCarType("Sedan")).toBe("sedan");
    expect(bodyTypeToCarType("4D HATCHBACK")).toBe("hatchback");
    expect(bodyTypeToCarType("2D COUPE")).toBe("coupe");
    expect(bodyTypeToCarType("Pick-up")).toBe("pickup");
    expect(bodyTypeToCarType("Sports")).toBe("sports");
  });
  it("falls back to other, and null for empty", () => {
    expect(bodyTypeToCarType("Limousine")).toBe("other");
    expect(bodyTypeToCarType("")).toBeNull();
    expect(bodyTypeToCarType(null)).toBeNull();
  });
});
