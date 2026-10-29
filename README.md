# @arijitgupta/geo-core

Shared geographic types, validation, coordinate conversion, normalization, and angular utilities for the `@arijitgupta` geo libraries.

> Initial scaffold. Treat the API and geographic conventions as pre-release until the first tagged release.

## Scope

- Canonical decimal-degree and DMS coordinate types
- Geographic bounds type and validation
- Runtime validation for untrusted values
- DMS-to-decimal conversion
- Coordinate normalization
- Angle and degree/radian utilities
- Shared Earth and angular constants

This package does not implement distance, bearing, or bounding-box algorithms.

## Development

```sh
npm install
npm run check
npm test
npm run build
```

## Coordinate conventions

- Latitude: finite decimal degrees in [-90, 90].
- Longitude: finite decimal degrees in [-180, 180].
- DMS minutes and seconds: finite values in [0, 60).
- Latitude direction: `N` or `S`; longitude direction: `E` or `W`.
- Bounds may cross the antimeridian: `west > east` is allowed. Latitude bounds must satisfy `south <= north`.

Validation rejects invalid values. `normalizeLongitude` and `normalizeAngle` are explicit wrapping utilities; `normalizeCoordinate` validates geographic ranges and does not silently wrap invalid coordinates.

## License

MIT
