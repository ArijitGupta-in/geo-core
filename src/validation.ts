import {
    MAX_LATITUDE,
    MAX_LONGITUDE,
    MINUTES_PER_DEGREE,
    MIN_LATITUDE,
    MIN_LONGITUDE,
    SECONDS_PER_MINUTE,
} from "./constants.js";
import { dmsToMagnitude } from "./dms.js";
import type {
    Bounds,
    Coordinate,
    DMSCoordinate,
    LatitudeDMS,
    LatitudeDirection,
    LongitudeDMS,
    LongitudeDirection,
} from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertFiniteNumber(
    value: unknown,
    name: string
): asserts value is number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new TypeError(name + " must be a finite number");
    }
}

function validateDegrees(degrees: number, max: number, axis: string): void {
    if (!Number.isInteger(degrees)) {
        throw new RangeError(
            axis + " degrees must be an integer, got " + degrees
        );
    }
    if (degrees < 0 || degrees > max) {
        throw new RangeError(
            axis + " degrees must be in [0, " + max + "], got " + degrees
        );
    }
}

function validateMinutes(minutes: number): void {
    if (!Number.isInteger(minutes)) {
        throw new RangeError("Minutes must be an integer, got " + minutes);
    }
    if (minutes < 0 || minutes >= MINUTES_PER_DEGREE) {
        throw new RangeError(
            "Minutes must be in [0, " + MINUTES_PER_DEGREE + "), got " + minutes
        );
    }
}

function validateSeconds(seconds: number): void {
    if (seconds < 0 || seconds >= SECONDS_PER_MINUTE) {
        throw new RangeError(
            "Seconds must be in [0, " + SECONDS_PER_MINUTE + "), got " + seconds
        );
    }
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

/** Structural type guard for a decimal-degree coordinate with finite numeric fields. Ranges are not checked. */
export function isCoordinate(value: unknown): value is Coordinate {
    return (
        isRecord(value) &&
        isFiniteNumber(value.latitude) &&
        isFiniteNumber(value.longitude)
    );
}

/** Structural type guard for a DMS coordinate with finite numeric fields. Ranges are not checked. */
export function isDMSCoordinate(value: unknown): value is DMSCoordinate {
    if (
        !isRecord(value) ||
        !isRecord(value.latitude) ||
        !isRecord(value.longitude)
    )
        return false;
    const lat = value.latitude;
    const lon = value.longitude;
    return (
        isFiniteNumber(lat.degrees) &&
        isFiniteNumber(lat.minutes) &&
        isFiniteNumber(lat.seconds) &&
        (lat.direction === "N" || lat.direction === "S") &&
        isFiniteNumber(lon.degrees) &&
        isFiniteNumber(lon.minutes) &&
        isFiniteNumber(lon.seconds) &&
        (lon.direction === "E" || lon.direction === "W")
    );
}

/** Validates a single decimal-degree latitude. */
export function validateLatitude(latitude: number): void {
    assertFiniteNumber(latitude, "Latitude");
    if (latitude < MIN_LATITUDE || latitude > MAX_LATITUDE) {
        throw new RangeError(
            "Latitude must be between -90 and 90, got " + latitude
        );
    }
}

/** Validates a single decimal-degree longitude. */
export function validateLongitude(longitude: number): void {
    assertFiniteNumber(longitude, "Longitude");
    if (longitude < MIN_LONGITUDE || longitude > MAX_LONGITUDE) {
        throw new RangeError(
            "Longitude must be between -180 and 180, got " + longitude
        );
    }
}

/** Validates a decimal-degree coordinate. */
export function validateCoordinate(value: Coordinate): void {
    if (!isRecord(value)) throw new TypeError("Coordinate must be an object");
    // Both fields are type-checked before ranges so a bad longitude type is reported first.
    assertFiniteNumber(value.latitude, "Latitude");
    assertFiniteNumber(value.longitude, "Longitude");
    validateLatitude(value.latitude);
    validateLongitude(value.longitude);
}

interface DMSAxis<D extends string> {
    label: string;
    positive: D;
    negative: D;
    maxDegrees: number;
}

const LATITUDE_AXIS: DMSAxis<LatitudeDirection> = {
    label: "Latitude",
    positive: "N",
    negative: "S",
    maxDegrees: MAX_LATITUDE,
};

const LONGITUDE_AXIS: DMSAxis<LongitudeDirection> = {
    label: "Longitude",
    positive: "E",
    negative: "W",
    maxDegrees: MAX_LONGITUDE,
};

function validateDMSAxis<D extends string>(
    value: { degrees: number; minutes: number; seconds: number; direction: D },
    axis: DMSAxis<D>
): void {
    const { label, positive, negative, maxDegrees } = axis;
    if (!isRecord(value))
        throw new TypeError(label + " DMS value must be an object");
    assertFiniteNumber(value.degrees, label + " degrees");
    assertFiniteNumber(value.minutes, label + " minutes");
    assertFiniteNumber(value.seconds, label + " seconds");
    if (value.direction !== positive && value.direction !== negative)
        throw new TypeError(
            label +
                ' direction must be "' +
                positive +
                '" or "' +
                negative +
                '"'
        );
    validateDegrees(value.degrees, maxDegrees, label);
    validateMinutes(value.minutes);
    validateSeconds(value.seconds);
    if (dmsToMagnitude(value) > maxDegrees) {
        throw new RangeError(
            "DMS " +
                label.toLowerCase() +
                " must not exceed " +
                maxDegrees +
                " degrees"
        );
    }
}

/** Validates a latitude DMS value: direction, integer degrees/minutes, seconds, and a total of at most 90 degrees. */
export function validateLatitudeDMS(value: LatitudeDMS): void {
    validateDMSAxis(value, LATITUDE_AXIS);
}

/** Validates a longitude DMS value: direction, integer degrees/minutes, seconds, and a total of at most 180 degrees. */
export function validateLongitudeDMS(value: LongitudeDMS): void {
    validateDMSAxis(value, LONGITUDE_AXIS);
}
/** Validates a DMS coordinate, including axis-specific directions and limits. */
export function validateDMSCoordinate(value: DMSCoordinate): void {
    if (!isRecord(value))
        throw new TypeError("DMS coordinate must be an object");
    validateLatitudeDMS(value.latitude);
    validateLongitudeDMS(value.longitude);
}

/**
 * Validates geographic bounds. west > east is allowed for antimeridian crossings.
 * west === east is a zero-width box (a single meridian); the full longitude
 * range is west -180, east 180.
 */
export function validateBounds(value: Bounds): void {
    if (!isRecord(value)) throw new TypeError("Bounds must be an object");
    assertFiniteNumber(value.north, "North bound");
    assertFiniteNumber(value.south, "South bound");
    assertFiniteNumber(value.east, "East bound");
    assertFiniteNumber(value.west, "West bound");
    if (value.south < MIN_LATITUDE || value.south > MAX_LATITUDE)
        throw new RangeError(
            "South bound must be between -90 and 90, got " + value.south
        );
    if (value.north < MIN_LATITUDE || value.north > MAX_LATITUDE)
        throw new RangeError(
            "North bound must be between -90 and 90, got " + value.north
        );
    if (value.south > value.north)
        throw new RangeError("South bound must not exceed north bound");
    if (value.west < MIN_LONGITUDE || value.west > MAX_LONGITUDE)
        throw new RangeError(
            "West bound must be between -180 and 180, got " + value.west
        );
    if (value.east < MIN_LONGITUDE || value.east > MAX_LONGITUDE)
        throw new RangeError(
            "East bound must be between -180 and 180, got " + value.east
        );
}
