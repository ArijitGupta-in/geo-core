import { describe, expect, it } from "vitest";
import { normalizeAngle, normalizeCoordinate, normalizeLongitude } from "../src/index.js";

describe("normalization", () => {
    it("returns a fresh validated decimal coordinate", () => {
        const input = { latitude: 22.5, longitude: 88.3 };
        const result = normalizeCoordinate(input);
        expect(result).toEqual(input);
        expect(result).not.toBe(input);
    });

    it("normalizes DMS coordinates", () => {
        expect(normalizeCoordinate({
            latitude: { degrees: 22, minutes: 30, seconds: 0, direction: "N" },
            longitude: { degrees: 88, minutes: 0, seconds: 0, direction: "E" },
        })).toEqual({ latitude: 22.5, longitude: 88 });
    });

    it("does not silently wrap invalid coordinates", () => {
        expect(() => normalizeCoordinate({ latitude: 0, longitude: 181 })).toThrow(RangeError);
        expect(() => normalizeCoordinate({ latitude: 91, longitude: 0 })).toThrow(RangeError);
    });

    it("returns canonical +180 for the antimeridian in decimal and DMS input", () => {
        expect(normalizeCoordinate({ latitude: 0, longitude: -180 })).toEqual({ latitude: 0, longitude: 180 });
        expect(normalizeCoordinate({
            latitude: { degrees: 0, minutes: 0, seconds: 0, direction: "N" },
            longitude: { degrees: 180, minutes: 0, seconds: 0, direction: "W" },
        })).toEqual({ latitude: 0, longitude: 180 });
    });

    it("reports specific errors for malformed input", () => {
        expect(() => normalizeCoordinate(null as never)).toThrow(TypeError);
        expect(() => normalizeCoordinate({ latitude: Number.NaN, longitude: 0 })).toThrow("Latitude must be a finite number");
        expect(() => normalizeCoordinate({ latitude: "1", longitude: 0 } as never)).toThrow(TypeError);
        expect(() => normalizeCoordinate({
            latitude: { degrees: 1, minutes: 0, seconds: 0, direction: "E" },
            longitude: { degrees: 0, minutes: 0, seconds: 0, direction: "E" },
        } as never)).toThrow('Latitude direction must be "N" or "S"');
        expect(() => normalizeCoordinate({
            latitude: { degrees: 1, minutes: 0, seconds: 0, direction: "N" },
            longitude: 5,
        } as never)).toThrow(TypeError);
    });

    it("wraps longitude and angles explicitly", () => {
        expect(normalizeLongitude(181)).toBe(-179);
        expect(normalizeLongitude(-181)).toBe(179);
        expect(normalizeLongitude(-180)).toBe(180);
        expect(normalizeLongitude(180)).toBe(180);
        expect(normalizeLongitude(540)).toBe(180);
        expect(normalizeLongitude(-540)).toBe(180);
        expect(normalizeAngle(-90)).toBe(270);
        expect(normalizeAngle(360)).toBe(0);
        expect(normalizeAngle(450)).toBe(90);
    });

    it("returns in-range longitudes bit-for-bit unchanged", () => {
        for (const value of [45.1, 0.1, -33.7, 179.9999, 1e-7, 88.3639, -122.4194, 12.345678901234, -179.9999999]) {
            expect(normalizeLongitude(value)).toBe(value);
        }
    });

    it("never returns negative zero from longitude wrapping", () => {
        expect(Object.is(normalizeLongitude(-0), 0)).toBe(true);
        expect(Object.is(normalizeLongitude(-360), 0)).toBe(true);
    });

    it("keeps wrapped results inside the canonical range", () => {
        for (const value of [-1e-20, 1e20, -1e20, 359.99999999999994, -359.99999999999994]) {
            const result = normalizeLongitude(value);
            expect(result).toBeGreaterThan(-180);
            expect(result).toBeLessThanOrEqual(180);
        }
        expect(normalizeAngle(-1e-15)).toBeLessThan(360);
    });

    it("rejects non-finite wrapping inputs", () => {
        expect(() => normalizeLongitude(Number.NaN)).toThrow(TypeError);
        expect(() => normalizeAngle(Number.POSITIVE_INFINITY)).toThrow(TypeError);
    });
});
