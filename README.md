# @arijitgupta/geo-core

[![npm version](https://img.shields.io/npm/v/@arijitgupta/geo-core)](https://www.npmjs.com/package/@arijitgupta/geo-core)
[![license](https://img.shields.io/npm/l/@arijitgupta/geo-core)](https://opensource.org/licenses/MIT)

A lightweight, dependency-free TypeScript package with the shared geographic types, validation,
coordinate conversion, normalization, and angular utilities used by the `@arijitgupta` geo libraries
([geo-distance](https://github.com/ArijitGupta-in/geo-distance),
[geo-bearing](https://github.com/ArijitGupta-in/geo-bearing),
[geo-bounds](https://github.com/ArijitGupta-in/geo-bounds)).

Accepts coordinates in **decimal degrees** or **Degrees, Minutes, Seconds (DMS)** format.

> Stable release (`1.0.0`). Public API changes follow semantic versioning.

## Installation

```bash
npm install @arijitgupta/geo-core
```

The package is ESM-only and has no Node.js version requirement of its own: it uses no Node.js APIs, and the compiled output imports on Node.js 14 through 26. Node.js 22.12 or later is only needed to run the development tooling (see [CONTRIBUTING.md](CONTRIBUTING.md)).

## Usage

### Validating coordinates

```ts
import { validateCoordinate, type Coordinate } from "@arijitgupta/geo-core";

const point: Coordinate = { latitude: 22.5726, longitude: 88.3639 };
validateCoordinate(point); // returns normally

validateCoordinate({ latitude: 91, longitude: 0 }); // throws RangeError
```

### DMS coordinates

```ts
import { dmsToDecimal, type DMSCoordinate } from "@arijitgupta/geo-core";

const kolkata: DMSCoordinate = {
    latitude:  { degrees: 22, minutes: 34, seconds: 21.36, direction: "N" },
    longitude: { degrees: 88, minutes: 21, seconds: 50.04, direction: "E" },
};

dmsToDecimal(kolkata);
// { latitude: 22.5726, longitude: 88.3639 }
```

### Normalizing input

```ts
import { normalizeAngle, normalizeCoordinate, normalizeLongitude } from "@arijitgupta/geo-core";

// Accepts decimal degrees or DMS and always returns a fresh decimal-degree coordinate.
normalizeCoordinate({ latitude: 22.5, longitude: 88.3 });
// { latitude: 22.5, longitude: 88.3 }

// Explicit wrapping utilities.
normalizeLongitude(181);  // -179
normalizeLongitude(-180); // 180 (canonical antimeridian)
normalizeAngle(-90);      // 270
```

### Degrees and radians

```ts
import { degreesToRadians, radiansToDegrees } from "@arijitgupta/geo-core";

degreesToRadians(180);     // Math.PI
radiansToDegrees(Math.PI); // 180
```

## API

### Types

| Type | Description |
| --- | --- |
| `Coordinate` | `{ latitude, longitude }` in decimal degrees |
| `DMSCoordinate` | `{ latitude: LatitudeDMS, longitude: LongitudeDMS }` |
| `LatitudeDMS` / `LongitudeDMS` | `{ degrees, minutes, seconds, direction }` for one axis |
| `LatitudeDirection` / `LongitudeDirection` | `"N" \| "S"` / `"E" \| "W"` |
| `CoordinateInput` | `Coordinate \| DMSCoordinate` |
| `Bounds` | `{ north, south, east, west }` in decimal degrees |

### Validation

All validators return `void` on success and throw on failure. Error messages include the offending value.

| Function | Description |
| --- | --- |
| `validateCoordinate(coord)` | Validates a decimal-degree `Coordinate` |
| `validateDMSCoordinate(dms)` | Validates a full `DMSCoordinate` |
| `validateLatitudeDMS(lat)` / `validateLongitudeDMS(lon)` | Validate a single DMS axis |
| `validateBounds(bounds)` | Validates a `Bounds`; `west > east` is allowed |
| `isCoordinate(value)` / `isDMSCoordinate(value)` | Structural type guards: object shape with **finite** numbers; ranges are not checked |

**Throws:** `TypeError` for a non-object value, a non-finite or non-numeric field, or an invalid direction.  
**Throws:** `RangeError` for a value outside its valid range, or for non-integer DMS `degrees` or `minutes`.

### Conversion

| Function | Description |
| --- | --- |
| `dmsToDecimal(dms)` | `DMSCoordinate` to decimal-degree `Coordinate` |
| `latitudeDMSToDecimal(lat)` / `longitudeDMSToDecimal(lon)` | Convert one DMS axis to signed decimal degrees |
| `degreesToRadians(deg)` / `radiansToDegrees(rad)` | Angle unit conversion |

DMS inputs are validated first, so these throw the same errors as the validators. Results never contain negative zero.
`degreesToRadians` and `radiansToDegrees` throw `TypeError` for non-finite input.

### Normalization

| Function | Description |
| --- | --- |
| `normalizeCoordinate(input)` | Validates decimal-degree or DMS input and returns a fresh decimal `Coordinate`. Invalid values are rejected, never wrapped. Longitude `-180` is returned as `180`. |
| `normalizeLongitude(lon)` | Wraps a finite longitude into `(-180, 180]`. Values already in range are returned unchanged. |
| `normalizeAngle(deg)` | Wraps a finite angle into `[0, 360)` |

`normalizeLongitude` and `normalizeAngle` throw `TypeError` for non-finite input and do not validate coordinates.

### Constants

`MIN_LATITUDE`, `MAX_LATITUDE`, `MIN_LONGITUDE`, `MAX_LONGITUDE`, `DEGREES_PER_CIRCLE`, `MINUTES_PER_DEGREE`,
`SECONDS_PER_MINUTE`, `SECONDS_PER_DEGREE`, `RADIANS_PER_DEGREE`, `DEGREES_PER_RADIAN`, and
`MEAN_EARTH_RADIUS_METERS` (`6,371,000`; a spherical mean radius, not an ellipsoid parameter).

## Coordinate conventions

- Latitude: finite decimal degrees in `[-90, 90]`.
- Longitude: finite decimal degrees in `[-180, 180]`. Both `-180` and `180` are valid input; `180` is the canonical output of the normalization functions.
- DMS `degrees` and `minutes`: integers. `minutes` in `[0, 60)`, `seconds` finite in `[0, 60)`.
- DMS latitude `degrees` in `[0, 90]` and longitude `degrees` in `[0, 180]`; the combined value must not exceed 90° / 180°.
- Latitude direction: `N` or `S`; longitude direction: `E` or `W`.
- Bounds require `south <= north`. Longitude is circular: `west > east` is an antimeridian-crossing box, `west === east` is a zero-width box (a single meridian), and `west: -180, east: 180` spans every longitude.

Validation rejects invalid values. `normalizeLongitude` and `normalizeAngle` are explicit wrapping utilities; `normalizeCoordinate` validates geographic ranges and does not silently wrap invalid coordinates.

## Behavior

- Has no runtime dependencies.
- Does not implement distance, bearing, or bounding-box algorithms; see [geo-distance](https://github.com/ArijitGupta-in/geo-distance), [geo-bearing](https://github.com/ArijitGupta-in/geo-bearing), and [geo-bounds](https://github.com/ArijitGupta-in/geo-bounds).

## Development

```bash
npm install            # install dev dependencies
npm test               # run tests with Vitest
npm run test:coverage  # run tests and enforce the 80% coverage threshold
npm run check          # type-check source and tests without emitting output
npm run build          # compile TypeScript to dist/
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for conventions and [CHANGELOG.md](CHANGELOG.md) for release notes.

## License

MIT
