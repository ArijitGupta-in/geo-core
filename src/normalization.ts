import { DEGREES_PER_CIRCLE, MAX_LONGITUDE, MIN_LONGITUDE } from "./constants.js";
import { dmsToDecimal } from "./conversion.js";
import { isCoordinate, isDMSCoordinate, validateCoordinate } from "./validation.js";
import type { Coordinate, CoordinateInput } from "./types.js";

/**
 * Wraps a finite longitude into [-180, 180], using +180 as the canonical
 * representation for the antimeridian. This does not validate a coordinate.
 */
export function normalizeLongitude(longitude: number): number {
    if (!Number.isFinite(longitude)) throw new TypeError("Longitude must be a finite number");
    const wrapped = (((longitude - MIN_LONGITUDE) % DEGREES_PER_CIRCLE) + DEGREES_PER_CIRCLE)
        % DEGREES_PER_CIRCLE + MIN_LONGITUDE;
    return wrapped === MIN_LONGITUDE ? MAX_LONGITUDE : wrapped;
}

/** Wraps a finite angle into [0, 360). */
export function normalizeAngle(degrees: number): number {
    if (!Number.isFinite(degrees)) throw new TypeError("Angle must be a finite number");
    return ((degrees % DEGREES_PER_CIRCLE) + DEGREES_PER_CIRCLE) % DEGREES_PER_CIRCLE;
}

/**
 * Validates and converts decimal-degree or DMS input to a fresh decimal-degree
 * coordinate. Out-of-range decimal coordinates are rejected, not wrapped.
 */
export function normalizeCoordinate(value: CoordinateInput): Coordinate {
    if (isDMSCoordinate(value)) return dmsToDecimal(value);
    if (isCoordinate(value)) {
        validateCoordinate(value);
        return { latitude: value.latitude, longitude: value.longitude };
    }
    throw new TypeError("Coordinate must be a valid decimal-degree or DMS coordinate object");
}
