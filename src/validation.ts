import { MAX_LATITUDE, MAX_LONGITUDE, MIN_LATITUDE, MIN_LONGITUDE } from "./constants.js";
import type { Bounds, Coordinate, DMSCoordinate, LatitudeDMS, LongitudeDMS } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertFiniteNumber(value: unknown, name: string): asserts value is number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new TypeError(name + " must be a finite number");
    }
}

function validateMinutes(minutes: number): void {
    if (minutes < 0 || minutes >= 60) {
        throw new RangeError("Minutes must be in [0, 60), got " + minutes);
    }
}

function validateSeconds(seconds: number): void {
    if (seconds < 0 || seconds >= 60) {
        throw new RangeError("Seconds must be in [0, 60), got " + seconds);
    }
}

/** Structural type guard for a decimal-degree coordinate. Numeric ranges are not checked. */
export function isCoordinate(value: unknown): value is Coordinate {
    return isRecord(value) && typeof value.latitude === "number" && typeof value.longitude === "number";
}

/** Structural type guard for a DMS coordinate. Numeric ranges are not checked. */
export function isDMSCoordinate(value: unknown): value is DMSCoordinate {
    if (!isRecord(value) || !isRecord(value.latitude) || !isRecord(value.longitude)) return false;
    const lat = value.latitude;
    const lon = value.longitude;
    return typeof lat.degrees === "number" && typeof lat.minutes === "number" &&
        typeof lat.seconds === "number" && (lat.direction === "N" || lat.direction === "S") &&
        typeof lon.degrees === "number" && typeof lon.minutes === "number" &&
        typeof lon.seconds === "number" && (lon.direction === "E" || lon.direction === "W");
}

/** Validates a decimal-degree coordinate. */
export function validateCoordinate(value: Coordinate): void {
    if (!isRecord(value)) throw new TypeError("Coordinate must be an object");
    assertFiniteNumber(value.latitude, "Latitude");
    assertFiniteNumber(value.longitude, "Longitude");
    if (value.latitude < MIN_LATITUDE || value.latitude > MAX_LATITUDE) {
        throw new RangeError("Latitude must be between -90 and 90, got " + value.latitude);
    }
    if (value.longitude < MIN_LONGITUDE || value.longitude > MAX_LONGITUDE) {
        throw new RangeError("Longitude must be between -180 and 180, got " + value.longitude);
    }
}

function validateLatitudeDMS(value: LatitudeDMS): void {
    if (!isRecord(value)) throw new TypeError("Latitude DMS value must be an object");
    assertFiniteNumber(value.degrees, "Latitude degrees");
    assertFiniteNumber(value.minutes, "Latitude minutes");
    assertFiniteNumber(value.seconds, "Latitude seconds");
    if (value.direction !== "N" && value.direction !== "S") throw new TypeError('Latitude direction must be "N" or "S"');
    if (value.degrees < 0 || value.degrees > MAX_LATITUDE) throw new RangeError("Latitude degrees must be in [0, 90], got " + value.degrees);
    validateMinutes(value.minutes);
    validateSeconds(value.seconds);
    if (value.degrees + value.minutes / 60 + value.seconds / 3600 > MAX_LATITUDE) {
        throw new RangeError("DMS latitude must not exceed 90 degrees");
    }
}

function validateLongitudeDMS(value: LongitudeDMS): void {
    if (!isRecord(value)) throw new TypeError("Longitude DMS value must be an object");
    assertFiniteNumber(value.degrees, "Longitude degrees");
    assertFiniteNumber(value.minutes, "Longitude minutes");
    assertFiniteNumber(value.seconds, "Longitude seconds");
    if (value.direction !== "E" && value.direction !== "W") throw new TypeError('Longitude direction must be "E" or "W"');
    if (value.degrees < 0 || value.degrees > MAX_LONGITUDE) throw new RangeError("Longitude degrees must be in [0, 180], got " + value.degrees);
    validateMinutes(value.minutes);
    validateSeconds(value.seconds);
    if (value.degrees + value.minutes / 60 + value.seconds / 3600 > MAX_LONGITUDE) {
        throw new RangeError("DMS longitude must not exceed 180 degrees");
    }
}

/** Validates a DMS coordinate, including axis-specific directions and limits. */
export function validateDMSCoordinate(value: DMSCoordinate): void {
    if (!isRecord(value)) throw new TypeError("DMS coordinate must be an object");
    validateLatitudeDMS(value.latitude);
    validateLongitudeDMS(value.longitude);
}

/** Validates geographic bounds. west > east is allowed for antimeridian crossings. */
export function validateBounds(value: Bounds): void {
    if (!isRecord(value)) throw new TypeError("Bounds must be an object");
    assertFiniteNumber(value.north, "North bound");
    assertFiniteNumber(value.south, "South bound");
    assertFiniteNumber(value.east, "East bound");
    assertFiniteNumber(value.west, "West bound");
    if (value.south < MIN_LATITUDE || value.south > MAX_LATITUDE) throw new RangeError("South bound must be between -90 and 90, got " + value.south);
    if (value.north < MIN_LATITUDE || value.north > MAX_LATITUDE) throw new RangeError("North bound must be between -90 and 90, got " + value.north);
    if (value.south > value.north) throw new RangeError("South bound must not exceed north bound");
    if (value.west < MIN_LONGITUDE || value.west > MAX_LONGITUDE) throw new RangeError("West bound must be between -180 and 180, got " + value.west);
    if (value.east < MIN_LONGITUDE || value.east > MAX_LONGITUDE) throw new RangeError("East bound must be between -180 and 180, got " + value.east);
}
