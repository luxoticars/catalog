export type CarType = "sedan" | "suv" | "mpv" | "hatchback" | "coupe" | "sports" | "pickup" | "other";

/** Maps a catalog row's free-form `bodyType` ("MPV", "4D SUV") onto the fixed `car_type` enum. */
export function bodyTypeToCarType(bodyType: string | null | undefined): CarType | null {
  const v = (bodyType ?? "").trim().toLowerCase();
  if (!v) return null;
  if (v.includes("coupe") || v.includes("coupé")) return "coupe";
  if (v.includes("hatch")) return "hatchback";
  if (v.includes("mpv") || v.includes("van") || v.includes("people")) return "mpv";
  if (v.includes("pick") || v.includes("truck")) return "pickup";
  if (v.includes("suv") || v.includes("crossover") || v.includes("4x4") || v.includes("sport utility") || v.includes("sports utility")) return "suv";
  if (v.includes("convertible") || v.includes("roadster") || v.includes("spyder") || v.includes("spider") || v === "sports" || v.includes("sports car")) return "sports";
  if (v.includes("sedan") || v.includes("saloon")) return "sedan";
  return "other";
}
