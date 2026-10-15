import type { Powertrain, Propulsion } from "./types.js";

/**
 * Normalises a free-text engine size to cubic centimetres.
 * "1998" -> 1998, "1.5" -> 1500, "3" -> 3000, "6.75" -> 6750.
 * Returns null for empty, zero (the seed's convention for electric) or
 * ambiguous input (21..99 could be neither litres nor cc).
 */
export function parseEngineCc(raw: string | number | null | undefined): number | null {
  const text = String(raw ?? "").trim().toLowerCase().replace(/\s*(cc|l|litres?|liters?)$/, "");
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  const n = Number(text);
  if (n === 0) return null;
  if (n >= 100) return Math.round(n);
  if (n <= 20) return Math.round(n * 1000);
  return null;
}

/** Maps the seed's legacy `fuelType` text onto `propulsion`. */
export function propulsionFromFuelType(fuelType: string | null | undefined): Propulsion | undefined {
  switch ((fuelType ?? "").trim().toUpperCase()) {
    case "PETROL":
    case "DIESEL":
      return "ice";
    case "ELECTRIC":
      return "ev";
    case "HYBRID":
      return "hybrid";
    case "PLUG-IN HYBRID":
    case "PHEV":
      return "phev";
    default:
      return undefined;
  }
}

function groupThousands(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Litres to two decimals, dropping a trailing zero: 1998 -> "2.0", 1499 -> "1.5", 6750 -> "6.75". */
function litres(cc: number): string {
  const s = (Math.round(cc / 10) / 100).toFixed(2);
  return s.endsWith("0") ? s.slice(0, -1) : s;
}

/**
 * The text a dealer sees in the Engine select: "2.0L (1,998 cc)" for a combustion
 * engine, "75 kWh" for an EV, otherwise whatever the row originally said.
 */
export function formatEngineLabel(p: Pick<Powertrain, "engine" | "engineCc" | "batteryKwh" | "propulsion">): string {
  if (p.propulsion === "ev") {
    return p.batteryKwh ? `${p.batteryKwh} kWh` : "Electric";
  }
  const cc = p.engineCc ?? parseEngineCc(p.engine);
  if (cc) return `${litres(cc)}L (${groupThousands(cc)} cc)`;
  return p.engine;
}
