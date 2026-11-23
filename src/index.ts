export * from "./types.js";
export { slug } from "./slug.js";
export { parseEngineCc, propulsionFromFuelType, formatEngineLabel } from "./engine.js";
export { CAR_TYPES, CAR_TYPE_LABELS, isCarType, bodyTypeToCarType, resolveCarType, type CarType } from "./body-type.js";
export { deriveYears, deriveMakes, deriveModels, deriveSpecs, buildMakesIndex, makesForYear } from "./derive.js";
export { keys, SCHEMA_VERSION } from "./keys.js";
export {
  CatalogFormatError,
  parseCarRecord,
  parseCarRecords,
  parseMakesIndex,
  parseMeta,
  assertCompatible,
} from "./validate.js";
export { createCatalogReader, type KvJsonReader } from "./reader.js";
