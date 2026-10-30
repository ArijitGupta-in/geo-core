# Contributing to @arijitgupta/geo-core

Thank you for your interest in contributing. This document covers everything you need to get started.

## Prerequisites

- **Node.js** 22.12 or later (CI runs on the 22, 24, and 26 LTS lines). This applies to development tooling only; the published package has no Node.js version requirement.
- **npm** 10 or later

## Setup

```bash
git clone https://github.com/ArijitGupta-in/geo-core.git
cd geo-core
npm install
```

## Development workflow

| Command | Purpose |
| --- | --- |
| `npm test` | Run the full test suite (Vitest) |
| `npm run test:coverage` | Run the tests and enforce the 80% coverage threshold |
| `npm run check` | Type-check source and tests without emitting output |
| `npm run lint:md` | Lint Markdown files |
| `npm run build` | Compile TypeScript to `dist/` |

Run `npm run check`, `npm run lint:md`, and `npm run test:coverage` before opening a pull request. All must pass cleanly.

## Project conventions

### TypeScript

- Source files live under `src/`; tests live under `tests/` and import from `../src/index.js`.
- The public API is defined entirely in `src/index.ts`. Only symbols re-exported there are part of the contract.
- Use `import type` for type-only imports.

### File organisation

| File | Contents |
| --- | --- |
| `src/types.ts` | All exported types and interfaces |
| `src/constants.ts` | Shared angular and Earth constants |
| `src/validation.ts` | Validators and structural type guards |
| `src/dms.ts` | Internal DMS arithmetic shared by validation and conversion |
| `src/conversion.ts` | DMS/decimal and degree/radian conversion |
| `src/normalization.ts` | Longitude, angle, and coordinate normalization |
| `src/equality.ts` | Coordinate comparison |
| `src/index.ts` | Public API barrel |

### No runtime dependencies

This library intentionally has zero runtime dependencies. Do not add any.

### Validation

- Validate all inputs at the public boundary. Throw `TypeError` for wrong types, non-finite numbers, and invalid directions; throw `RangeError` for out-of-range or non-integer values. Include the bad value in the error message.
- Use the shared constants (`MINUTES_PER_DEGREE`, `SECONDS_PER_DEGREE`, ...) instead of literals.
- Never return negative zero, and never perturb already-valid input in normalization functions.

### Tests

- Every new public function needs tests covering happy-path values, boundary values, and invalid inputs that should throw.
- Compare computed floating-point results with `toBeCloseTo`; use `toBe` only for values that must be bit-for-bit identical.
- Keep test descriptions concise and specific. Use `as never` only where testing deliberate misuse.
- New and changed code needs at least 80% coverage.

### Commit messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) style:

```plaintext
feat: add validateBounds helper
fix: keep in-range longitudes unchanged
docs: clarify bounds semantics
test: cover longitude boundary at 180°
refactor: share DMS conversion helper
chore: bump vitest
```

### Changelog

Update `CHANGELOG.md` for every user-visible change. Add entries under `[Unreleased]` using the categories defined by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/): **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**. Internal-only changes may be noted under **Internal**.

Update `README.md` whenever the public API or the coordinate conventions change.

## Submitting a pull request

1. Fork the repository and create a branch from `main`.
2. Make your changes, following the conventions above.
3. Run `npm run check`, `npm run lint:md`, and `npm run test:coverage` — all must pass.
4. Open a pull request against `main`. Describe *what* changed and *why*.
5. Link any related issue (e.g. `Closes #1`).

## Releasing

Publishing runs from GitHub Actions through npm trusted publishing, triggered by a `v*` tag.

1. Move the `[Unreleased]` changelog entries under a new version heading and commit.
2. Run `npm version <patch|minor|major>`; it bumps `package.json`, commits, and creates the `vX.Y.Z` tag.
3. Run `git push --follow-tags`. The `Publish to npm` workflow fails unless the tag matches the `package.json` version.
4. Create a GitHub release for the tag using the changelog entry as the notes.

## Reporting issues

Use the [issue tracker](https://github.com/ArijitGupta-in/geo-core/issues). Include a minimal reproduction and the version you are using.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
