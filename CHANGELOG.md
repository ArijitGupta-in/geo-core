# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

## [1.1.0] - 2026-10-30

### Added

- `decimalToDMS`, `latitudeToDMS`, and `longitudeToDMS`: the inverse of `dmsToDecimal`, with a `fractionDigits` option (default 6, range 0 to 9). Seconds never round up to 60, and values that round to zero stay in the N/E hemisphere.
- `coordinatesEqual(a, b, tolerance?)`: compares decimal or DMS coordinates, treating longitude `-180` and `180` as equal, comparing longitude around the circle, and treating the same pole as equal regardless of longitude.
- `DMSOptions` type.
- `publishConfig.access: "public"` in `package.json`.
- `lint:md` script and `.markdownlint.json`, run in CI.

### Changed

- `tsconfig.json` now enables `verbatimModuleSyntax`, `isolatedModules`, `noUncheckedSideEffectImports`, and `moduleDetection: "force"`, matching the sibling packages. Source maps and declaration maps stay disabled because `src` is not published.
- CI uses `actions/checkout@v6` and `actions/setup-node@v6` with read-only `contents` permissions.

### Internal

- `validateLatitudeDMS` and `validateLongitudeDMS` share one axis-parameterised validator, and DMS-to-decimal arithmetic lives in a single `dmsToMagnitude` helper. Public behavior and error messages are unchanged.
- Single-value `validateLatitude` and `validateLongitude` helpers back `validateCoordinate` and the new single-axis conversions.

## [1.0.0] - 2026-10-30

### Added

- `validateLatitudeDMS` and `validateLongitudeDMS` exported from the public API for validating a single DMS axis.
- `test:coverage` script with an 80% coverage threshold, enforced in CI and before publishing.
- `sideEffects: false` in `package.json`.
- `CONTRIBUTING.md` and this changelog.

### Changed

- `isCoordinate` and `isDMSCoordinate` now require finite numbers, so `NaN` and `Infinity` no longer pass the guards.
- DMS `degrees` and `minutes` must be integers; fractional values now throw `RangeError`.
- `normalizeCoordinate` now returns longitude `-180` (decimal or `180°W` DMS) as the canonical `180`, matching `normalizeLongitude`.
- `normalizeCoordinate` now throws the specific validator errors (for example `Latitude must be a finite number`) instead of a generic `TypeError` for malformed input.
- `npm run check` now also type-checks the tests (`tsconfig.test.json`).
- Source maps and declaration maps are no longer generated, because the published package does not include `src`.
- CI uses `npm ci` with a committed lockfile and runs the tooling on Node.js 22, 24, and 26 (the current LTS lines). The package itself has no Node.js version requirement.

### Fixed

- `normalizeLongitude` no longer perturbs longitudes that are already in range (for example `45.1` previously returned `45.10000000000002`).
- `normalizeLongitude` no longer returns negative zero.
- DMS conversion no longer returns negative zero for `0°0'0"` in the south or west hemisphere.

### Documented

- Bounds semantics: `west === east` is a zero-width box, and `west: -180, east: 180` spans every longitude.

### Internal

- DMS-to-decimal arithmetic consolidated into one helper using the shared constants instead of literal `60` and `3600`.
- Single-axis DMS conversion validates directly instead of through a placeholder coordinate.
- Tests cover the type guards, every validation branch, and in-range longitude identity.
