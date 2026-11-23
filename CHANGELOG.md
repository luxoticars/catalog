# @luxoticars/catalog

## 0.2.0

### Minor Changes

- 34b23aa: Add an optional curated `carType` to catalog records and specs, the shared `CAR_TYPES` list with labels (adds wagon, convertible, sportcar, sport-touring, supercar and hypercar), `isCarType` and `resolveCarType`. `bodyTypeToCarType` now maps wagons, convertibles and pickups that it used to call "other" or "sports".
