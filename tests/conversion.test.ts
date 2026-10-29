import { describe, expect, it } from "vitest";
import { degreesToRadians, dmsToDecimal, latitudeDMSToDecimal, longitudeDMSToDecimal, radiansToDegrees } from "../src/index.js";

describe("coordinate conversion", () => {
    it("converts DMS to decimal degrees", () => {
        expect(dmsToDecimal({
            latitude: { degrees: 22, minutes: 34, seconds: 21.36, direction: "N" },
            longitude: { degrees: 88, minutes: 21, seconds: 50.04, direction: "E" },
        })).toEqual({ latitude: 22.5726, longitude: 88.3639 });
    });

    it("applies hemisphere signs", () => {
        expect(latitudeDMSToDecimal({ degrees: 12, minutes: 30, seconds: 0, direction: "S" })).toBe(-12.5);
        expect(longitudeDMSToDecimal({ degrees: 45, minutes: 15, seconds: 0, direction: "W" })).toBe(-45.25);
    });

    it("converts degrees and radians", () => {
        expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
        expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
    });

    it("rejects non-finite angular inputs", () => {
        expect(() => degreesToRadians(Number.NaN)).toThrow(TypeError);
        expect(() => radiansToDegrees(Number.POSITIVE_INFINITY)).toThrow(TypeError);
    });
});
