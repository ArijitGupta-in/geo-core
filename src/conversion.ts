import {
    DEGREES_PER_RADIAN,
    RADIANS_PER_DEGREE,
    SECONDS_PER_DEGREE,
    SECONDS_PER_MINUTE,
} from "./constants.js";
import { dmsToMagnitude } from "./dms.js";
import {
    validateCoordinate,
    validateDMSCoordinate,
    validateLatitude,
    validateLatitudeDMS,
    validateLongitude,
    validateLongitudeDMS,
} from "./validation.js";
import type {
    Coordinate,
    DMSCoordinate,
    DMSOptions,
    LatitudeDMS,
    LongitudeDMS,
} from "./types.js";

const DEFAULT_FRACTION_DIGITS = 6;
const MAX_FRACTION_DIGITS = 9;

/** Combines DMS components into a signed decimal value, never producing negative zero. */
function toSignedDecimal(
    value: { degrees: number; minutes: number; seconds: number },
    negative: boolean
): number {
    const magnitude = dmsToMagnitude(value);
    return negative && magnitude !== 0 ? -magnitude : magnitude;
}

function resolveFractionDigits(options: DMSOptions | undefined): number {
    const digits = options?.fractionDigits ?? DEFAULT_FRACTION_DIGITS;
    if (!Number.isInteger(digits))
        throw new TypeError("fractionDigits must be an integer");
    if (digits < 0 || digits > MAX_FRACTION_DIGITS)
        throw new RangeError(
            "fractionDigits must be in [0, " +
                MAX_FRACTION_DIGITS +
                "], got " +
                digits
        );
    return digits;
}

/**
 * Splits a decimal value into DMS parts. Rounding happens once, on an integer
 * count of the smallest seconds unit, so seconds can never round up to 60.
 * A value that rounds to zero is never negative.
 */
function toDMSParts(value: number, fractionDigits: number) {
    const scale = 10 ** fractionDigits;
    const unitsPerMinute = SECONDS_PER_MINUTE * scale;
    const unitsPerDegree = SECONDS_PER_DEGREE * scale;
    const units = Math.round(Math.abs(value) * unitsPerDegree);
    return {
        degrees: Math.floor(units / unitsPerDegree),
        minutes: Math.floor((units % unitsPerDegree) / unitsPerMinute),
        seconds: (units % unitsPerMinute) / scale,
        negative: value < 0 && units !== 0,
    };
}

/** Converts finite degrees to radians. */
export function degreesToRadians(degrees: number): number {
    if (!Number.isFinite(degrees))
        throw new TypeError("Degrees must be a finite number");
    return degrees * RADIANS_PER_DEGREE;
}

/** Converts finite radians to degrees. */
export function radiansToDegrees(radians: number): number {
    if (!Number.isFinite(radians))
        throw new TypeError("Radians must be a finite number");
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
        latitude: toSignedDecimal(
            value.latitude,
            value.latitude.direction === "S"
        ),
        longitude: toSignedDecimal(
            value.longitude,
            value.longitude.direction === "W"
        ),
    };
}

/**
 * Converts a decimal latitude to DMS. Seconds are rounded to `fractionDigits`
 * decimal places (default 6, range 0 to 9).
 */
export function latitudeToDMS(
    latitude: number,
    options?: DMSOptions
): LatitudeDMS {
    validateLatitude(latitude);
    const { negative, ...parts } = toDMSParts(
        latitude,
        resolveFractionDigits(options)
    );
    return { ...parts, direction: negative ? "S" : "N" };
}

/**
 * Converts a decimal longitude to DMS. Seconds are rounded to `fractionDigits`
 * decimal places (default 6, range 0 to 9). Longitude -180 becomes 180°W.
 */
export function longitudeToDMS(
    longitude: number,
    options?: DMSOptions
): LongitudeDMS {
    validateLongitude(longitude);
    const { negative, ...parts } = toDMSParts(
        longitude,
        resolveFractionDigits(options)
    );
    return { ...parts, direction: negative ? "W" : "E" };
}

/** Converts a validated decimal-degree coordinate to DMS; the inverse of `dmsToDecimal`. */
export function decimalToDMS(
    value: Coordinate,
    options?: DMSOptions
): DMSCoordinate {
    validateCoordinate(value);
    return {
        latitude: latitudeToDMS(value.latitude, options),
        longitude: longitudeToDMS(value.longitude, options),
    };
}
