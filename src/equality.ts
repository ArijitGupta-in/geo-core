import { DEGREES_PER_CIRCLE, MAX_LATITUDE } from "./constants.js";
import { normalizeCoordinate } from "./normalization.js";
import type { CoordinateInput } from "./types.js";

/**
 * Compares two coordinates (decimal or DMS) within a tolerance in degrees,
 * applied separately to latitude and to longitude (default 0, exact).
 * Longitude is compared around the circle, so -180 equals 180, and two
 * coordinates at the same pole are equal whatever their longitudes.
 * Invalid coordinates throw the same errors as `normalizeCoordinate`.
 */
export function coordinatesEqual(
    a: CoordinateInput,
    b: CoordinateInput,
    tolerance = 0
): boolean {
    if (typeof tolerance !== "number" || !Number.isFinite(tolerance))
        throw new TypeError("Tolerance must be a finite number");
    if (tolerance < 0)
        throw new RangeError(
            "Tolerance must not be negative, got " + tolerance
        );

    const first = normalizeCoordinate(a);
    const second = normalizeCoordinate(b);

    if (Math.abs(first.latitude - second.latitude) > tolerance) return false;
    if (
        Math.abs(first.latitude) === MAX_LATITUDE &&
        Math.abs(second.latitude) === MAX_LATITUDE
    )
        return true;

    const delta = Math.abs(first.longitude - second.longitude);
    return Math.min(delta, DEGREES_PER_CIRCLE - delta) <= tolerance;
}
