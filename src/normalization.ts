import {
    DEGREES_PER_CIRCLE,
    MAX_LONGITUDE,
    MIN_LONGITUDE,
} from "./constants.js";
import { dmsToDecimal } from "./conversion.js";
import { validateCoordinate } from "./validation.js";
import type { Coordinate, CoordinateInput, DMSCoordinate } from "./types.js";

/**
 * Wraps a finite longitude into (-180, 180], using +180 as the canonical
 * representation for the antimeridian. Values already in that range are
 * returned unchanged. This does not validate a coordinate.
 */
export function normalizeLongitude(longitude: number): number {
    if (!Number.isFinite(longitude))
        throw new TypeError("Longitude must be a finite number");
    // The remainder is exact in floating point, so in-range input is never perturbed.
    let wrapped = longitude % DEGREES_PER_CIRCLE;
    if (wrapped > MAX_LONGITUDE) wrapped -= DEGREES_PER_CIRCLE;
    else if (wrapped <= MIN_LONGITUDE) wrapped += DEGREES_PER_CIRCLE;
    return wrapped === 0 ? 0 : wrapped;
}

/** Wraps a finite angle into [0, 360). */
export function normalizeAngle(degrees: number): number {
    if (!Number.isFinite(degrees))
        throw new TypeError("Angle must be a finite number");
    return (
        ((degrees % DEGREES_PER_CIRCLE) + DEGREES_PER_CIRCLE) %
        DEGREES_PER_CIRCLE
    );
}

/**
 * Validates and converts decimal-degree or DMS input to a fresh decimal-degree
 * coordinate. Out-of-range coordinates are rejected, not wrapped; the only
 * adjustment is that longitude -180 is returned as the canonical +180.
 * Malformed input throws the same specific errors as the validators.
 */
export function normalizeCoordinate(value: CoordinateInput): Coordinate {
    const candidate: unknown = value;
    const isDMSShaped =
        typeof candidate === "object" &&
        candidate !== null &&
        typeof (candidate as { latitude?: unknown }).latitude === "object";
    if (isDMSShaped) {
        const { latitude, longitude } = dmsToDecimal(value as DMSCoordinate);
        return { latitude, longitude: normalizeLongitude(longitude) };
    }
    validateCoordinate(value as Coordinate);
    const { latitude, longitude } = value as Coordinate;
    return { latitude, longitude: normalizeLongitude(longitude) };
}
