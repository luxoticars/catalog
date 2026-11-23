---
"@luxoticars/catalog": minor
---
Add an optional curated `carType` to catalog records and specs, the shared `CAR_TYPES` list with labels (adds wagon, convertible, supercar and hypercar), `isCarType` and `resolveCarType`. `bodyTypeToCarType` now maps wagons, convertibles and pickups that it used to call "other" or "sports".
