import { describe, expect, it } from "vitest";
import { degreesToRadians, dmsToDecimal, latitudeDMSToDecimal, longitudeDMSToDecimal, radiansToDegrees } from "../src/index.js";

describe("coordinate conversion", () => {
    it("converts DMS to decimal degrees", () => {
        const result = dmsToDecimal({
            latitude: { degrees: 22, minutes: 34, seconds: 21.36, direction: "N" },
            longitude: { degrees: 88, minutes: 21, seconds: 50.04, direction: "E" },
        });
        expect(result.latitude).toBeCloseTo(22.5726, 10);
        expect(result.longitude).toBeCloseTo(88.3639, 10);
    });

    it("applies hemisphere signs", () => {
        expect(latitudeDMSToDecimal({ degrees: 12, minutes: 30, seconds: 0, direction: "S" })).toBe(-12.5);
        expect(longitudeDMSToDecimal({ degrees: 45, minutes: 15, seconds: 0, direction: "W" })).toBe(-45.25);
        expect(dmsToDecimal({
            latitude: { degrees: 1, minutes: 0, seconds: 0, direction: "S" },
            longitude: { degrees: 1, minutes: 0, seconds: 0, direction: "W" },
        })).toEqual({ latitude: -1, longitude: -1 });
    });

    it("never returns negative zero", () => {
        const zero = { degrees: 0, minutes: 0, seconds: 0 };
        expect(Object.is(latitudeDMSToDecimal({ ...zero, direction: "S" }), 0)).toBe(true);
        expect(Object.is(longitudeDMSToDecimal({ ...zero, direction: "W" }), 0)).toBe(true);
        const result = dmsToDecimal({ latitude: { ...zero, direction: "S" }, longitude: { ...zero, direction: "W" } });
        expect(Object.is(result.latitude, 0)).toBe(true);
        expect(Object.is(result.longitude, 0)).toBe(true);
    });

    it("converts axis values at their limits", () => {
        expect(latitudeDMSToDecimal({ degrees: 90, minutes: 0, seconds: 0, direction: "N" })).toBe(90);
        expect(longitudeDMSToDecimal({ degrees: 180, minutes: 0, seconds: 0, direction: "W" })).toBe(-180);
    });

    it("rejects invalid single-axis DMS values", () => {
        expect(() => latitudeDMSToDecimal({ degrees: 10, minutes: 0, seconds: 0, direction: "W" } as never)).toThrow(TypeError);
        expect(() => latitudeDMSToDecimal({ degrees: 91, minutes: 0, seconds: 0, direction: "N" })).toThrow(RangeError);
        expect(() => longitudeDMSToDecimal({ degrees: 10, minutes: 60, seconds: 0, direction: "E" })).toThrow(RangeError);
        expect(() => longitudeDMSToDecimal({ degrees: 10, minutes: 0, seconds: 0, direction: "N" } as never)).toThrow(TypeError);
    });

    it("rejects invalid DMS coordinates", () => {
        expect(() => dmsToDecimal({
            latitude: { degrees: 10, minutes: 0, seconds: 60, direction: "N" },
            longitude: { degrees: 10, minutes: 0, seconds: 0, direction: "E" },
        })).toThrow(RangeError);
    });

    it("converts degrees and radians", () => {
        expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
        expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
        expect(degreesToRadians(0)).toBe(0);
    });

    it("rejects non-finite angular inputs", () => {
        expect(() => degreesToRadians(Number.NaN)).toThrow(TypeError);
        expect(() => radiansToDegrees(Number.POSITIVE_INFINITY)).toThrow(TypeError);
    });
});
