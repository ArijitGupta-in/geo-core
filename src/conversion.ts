import { DEGREES_PER_RADIAN, MINUTES_PER_DEGREE, RADIANS_PER_DEGREE, SECONDS_PER_DEGREE } from "./constants.js";
import { validateDMSCoordinate, validateLatitudeDMS, validateLongitudeDMS } from "./validation.js";
import type { Coordinate, DMSCoordinate, LatitudeDMS, LongitudeDMS } from "./types.js";

/** Combines DMS components into a signed decimal value, never producing negative zero. */
function toSignedDecimal(
    value: { degrees: number; minutes: number; seconds: number },
    negative: boolean,
): number {
    const magnitude = value.degrees + value.minutes / MINUTES_PER_DEGREE + value.seconds / SECONDS_PER_DEGREE;
    return negative && magnitude !== 0 ? -magnitude : magnitude;
}

/** Converts finite degrees to radians. */
export function degreesToRadians(degrees: number): number {
    if (!Number.isFinite(degrees)) throw new TypeError("Degrees must be a finite number");
    return degrees * RADIANS_PER_DEGREE;
}

/** Converts finite radians to degrees. */
export function radiansToDegrees(radians: number): number {
    if (!Number.isFinite(radians)) throw new TypeError("Radians must be a finite number");
    return radians * DEGREES_PER_RADIAN;
}

/** Converts a latitude DMS value to signed decimal degrees. */
export function latitudeDMSToDecimal(value: LatitudeDMS): number {
    validateLatitudeDMS(value);
    return toSignedDecimal(value, value.direction === "S");
}

/** Converts a longitude DMS value to signed decimal degrees. */
export function longitudeDMSToDecimal(value: LongitudeDMS): number {
    validateLongitudeDMS(value);
    return toSignedDecimal(value, value.direction === "W");
}

/** Converts a validated DMS coordinate to decimal degrees. */
export function dmsToDecimal(value: DMSCoordinate): Coordinate {
    validateDMSCoordinate(value);
    return {
        latitude: toSignedDecimal(value.latitude, value.latitude.direction === "S"),
        longitude: toSignedDecimal(value.longitude, value.longitude.direction === "W"),
    };
}
