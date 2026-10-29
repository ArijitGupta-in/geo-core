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
    });

    it("wraps longitude and angles explicitly", () => {
        expect(normalizeLongitude(181)).toBe(-179);
        expect(normalizeLongitude(-180)).toBe(180);
        expect(normalizeAngle(-90)).toBe(270);
        expect(normalizeAngle(360)).toBe(0);
    });

    it("rejects non-finite wrapping inputs", () => {
        expect(() => normalizeLongitude(Number.NaN)).toThrow(TypeError);
        expect(() => normalizeAngle(Number.POSITIVE_INFINITY)).toThrow(TypeError);
    });
});
