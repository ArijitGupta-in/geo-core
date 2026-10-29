import { DEGREES_PER_RADIAN, RADIANS_PER_DEGREE } from "./constants.js";
import { validateDMSCoordinate } from "./validation.js";
import type { Coordinate, DMSCoordinate, LatitudeDMS, LongitudeDMS } from "./types.js";

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
    validateDMSCoordinate({
        latitude: value,
        longitude: { degrees: 0, minutes: 0, seconds: 0, direction: "E" },
    });
    const magnitude = value.degrees + value.minutes / 60 + value.seconds / 3600;
    return value.direction === "S" ? -magnitude : magnitude;
}

/** Converts a longitude DMS value to signed decimal degrees. */
export function longitudeDMSToDecimal(value: LongitudeDMS): number {
    validateDMSCoordinate({
        latitude: { degrees: 0, minutes: 0, seconds: 0, direction: "N" },
        longitude: value,
    });
    const magnitude = value.degrees + value.minutes / 60 + value.seconds / 3600;
    return value.direction === "W" ? -magnitude : magnitude;
}

/** Converts a validated DMS coordinate to decimal degrees. */
export function dmsToDecimal(value: DMSCoordinate): Coordinate {
    validateDMSCoordinate(value);
    const latitude = value.latitude.degrees + value.latitude.minutes / 60 + value.latitude.seconds / 3600;
    const longitude = value.longitude.degrees + value.longitude.minutes / 60 + value.longitude.seconds / 3600;
    return {
        latitude: value.latitude.direction === "S" ? -latitude : latitude,
        longitude: value.longitude.direction === "W" ? -longitude : longitude,
    };
}
