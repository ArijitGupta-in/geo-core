import { describe, expect, it } from "vitest";
import {
    isCoordinate,
    isDMSCoordinate,
    validateBounds,
    validateCoordinate,
    validateDMSCoordinate,
    validateLatitudeDMS,
    validateLongitudeDMS,
} from "../src/index.js";

const origin = {
    latitude: { degrees: 0, minutes: 0, seconds: 0, direction: "N" },
    longitude: { degrees: 0, minutes: 0, seconds: 0, direction: "E" },
} as const;

describe("type guards", () => {
    it("accepts finite decimal coordinates only", () => {
        expect(isCoordinate({ latitude: 1, longitude: 2 })).toBe(true);
        expect(isCoordinate({ latitude: Number.NaN, longitude: 2 })).toBe(false);
        expect(isCoordinate({ latitude: 1, longitude: Number.POSITIVE_INFINITY })).toBe(false);
        expect(isCoordinate({ latitude: "1", longitude: 2 })).toBe(false);
        expect(isCoordinate(null)).toBe(false);
        expect(isCoordinate([])).toBe(false);
    });

    it("accepts finite DMS coordinates only", () => {
        expect(isDMSCoordinate(origin)).toBe(true);
        expect(isDMSCoordinate({ ...origin, latitude: { ...origin.latitude, degrees: Number.NaN } })).toBe(false);
        expect(isDMSCoordinate({ ...origin, longitude: { ...origin.longitude, seconds: "0" } })).toBe(false);
        expect(isDMSCoordinate({ ...origin, latitude: { ...origin.latitude, direction: "E" } })).toBe(false);
        expect(isDMSCoordinate({ ...origin, longitude: { ...origin.longitude, direction: "N" } })).toBe(false);
        expect(isDMSCoordinate({ latitude: 1, longitude: 2 })).toBe(false);
        expect(isDMSCoordinate(undefined)).toBe(false);
    });
});

describe("coordinate validation", () => {
    it("accepts boundary coordinates", () => {
        expect(() => validateCoordinate({ latitude: -90, longitude: 180 })).not.toThrow();
        expect(() => validateCoordinate({ latitude: 90, longitude: -180 })).not.toThrow();
    });

    it("rejects non-finite and out-of-range decimal coordinates", () => {
        expect(() => validateCoordinate({ latitude: Number.NaN, longitude: 0 })).toThrow(TypeError);
        expect(() => validateCoordinate({ latitude: 0, longitude: Number.POSITIVE_INFINITY })).toThrow(TypeError);
        expect(() => validateCoordinate({ latitude: 91, longitude: 0 })).toThrow(RangeError);
        expect(() => validateCoordinate({ latitude: -91, longitude: 0 })).toThrow(RangeError);
        expect(() => validateCoordinate({ latitude: 0, longitude: 181 })).toThrow(RangeError);
        expect(() => validateCoordinate({ latitude: 0, longitude: -181 })).toThrow(RangeError);
    });

    it("rejects non-object and non-numeric coordinates", () => {
        expect(() => validateCoordinate(null as never)).toThrow(TypeError);
        expect(() => validateCoordinate({ latitude: "1", longitude: 2 } as never)).toThrow(TypeError);
    });

    it("validates DMS directions and component limits", () => {
        expect(() => validateDMSCoordinate({
            latitude: { degrees: 90, minutes: 0, seconds: 0, direction: "N" },
            longitude: { degrees: 180, minutes: 0, seconds: 0, direction: "E" },
        })).not.toThrow();
        expect(() => validateDMSCoordinate({
            latitude: { degrees: 90, minutes: 1, seconds: 0, direction: "N" },
            longitude: { degrees: 0, minutes: 0, seconds: 0, direction: "E" },
        })).toThrow(RangeError);
        expect(() => validateDMSCoordinate({
            latitude: { degrees: 10, minutes: 0, seconds: 0, direction: "E" } as never,
            longitude: { degrees: 0, minutes: 0, seconds: 0, direction: "E" },
        })).toThrow(TypeError);
    });

    it("rejects out-of-range DMS components", () => {
        const lat = (patch: object) => ({ ...origin.latitude, ...patch }) as never;
        const lon = (patch: object) => ({ ...origin.longitude, ...patch }) as never;
        expect(() => validateLatitudeDMS(lat({ minutes: 60 }))).toThrow(RangeError);
        expect(() => validateLatitudeDMS(lat({ minutes: -1 }))).toThrow(RangeError);
        expect(() => validateLatitudeDMS(lat({ seconds: 60 }))).toThrow(RangeError);
        expect(() => validateLatitudeDMS(lat({ seconds: -0.5 }))).toThrow(RangeError);
        expect(() => validateLatitudeDMS(lat({ degrees: -1 }))).toThrow(RangeError);
        expect(() => validateLatitudeDMS(lat({ degrees: 91 }))).toThrow(RangeError);
        expect(() => validateLatitudeDMS(lat({ degrees: 90, seconds: 0.001 }))).toThrow(RangeError);
        expect(() => validateLongitudeDMS(lon({ degrees: 181 }))).toThrow(RangeError);
        expect(() => validateLongitudeDMS(lon({ degrees: 180, seconds: 1 }))).toThrow(RangeError);
        expect(() => validateLongitudeDMS(lon({ minutes: 60 }))).toThrow(RangeError);
    });

    it("rejects fractional degrees and minutes", () => {
        expect(() => validateLatitudeDMS({ ...origin.latitude, degrees: 10.5 })).toThrow("integer");
        expect(() => validateLongitudeDMS({ ...origin.longitude, degrees: 10.5 })).toThrow("integer");
        expect(() => validateLatitudeDMS({ ...origin.latitude, minutes: 30.5 })).toThrow("integer");
        expect(() => validateLatitudeDMS({ ...origin.latitude, seconds: 30.5 })).not.toThrow();
    });

    it("rejects non-finite and non-object DMS values", () => {
        expect(() => validateLatitudeDMS({ ...origin.latitude, degrees: Number.NaN })).toThrow(TypeError);
        expect(() => validateLongitudeDMS({ ...origin.longitude, seconds: Number.POSITIVE_INFINITY })).toThrow(TypeError);
        expect(() => validateLatitudeDMS(null as never)).toThrow(TypeError);
        expect(() => validateLongitudeDMS([] as never)).toThrow(TypeError);
        expect(() => validateDMSCoordinate(null as never)).toThrow(TypeError);
    });
});

describe("bounds validation", () => {
    it("allows antimeridian-crossing bounds", () => {
        expect(() => validateBounds({ north: 10, south: -10, west: 170, east: -170 })).not.toThrow();
    });

    it("allows zero-width and full-range longitude bounds", () => {
        expect(() => validateBounds({ north: 1, south: 0, west: 5, east: 5 })).not.toThrow();
        expect(() => validateBounds({ north: 90, south: -90, west: -180, east: 180 })).not.toThrow();
    });

    it("rejects inverted latitude bounds", () => {
        expect(() => validateBounds({ north: -10, south: 10, west: -20, east: 20 })).toThrow(RangeError);
    });

    it("rejects out-of-range and non-finite bounds", () => {
        const base = { north: 10, south: -10, west: -20, east: 20 };
        expect(() => validateBounds({ ...base, north: 91 })).toThrow(RangeError);
        expect(() => validateBounds({ ...base, south: -91 })).toThrow(RangeError);
        expect(() => validateBounds({ ...base, west: -181 })).toThrow(RangeError);
        expect(() => validateBounds({ ...base, east: 181 })).toThrow(RangeError);
        expect(() => validateBounds({ ...base, east: Number.NaN })).toThrow(TypeError);
        expect(() => validateBounds(null as never)).toThrow(TypeError);
    });
});
