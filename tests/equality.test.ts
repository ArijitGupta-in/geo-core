import { describe, expect, it } from "vitest";
import { coordinatesEqual } from "../src/index.js";

describe("coordinatesEqual", () => {
    it("compares identical and different coordinates exactly by default", () => {
        expect(
            coordinatesEqual(
                { latitude: 10, longitude: 20 },
                { latitude: 10, longitude: 20 }
            )
        ).toBe(true);
        expect(
            coordinatesEqual(
                { latitude: 10, longitude: 20 },
                { latitude: 10, longitude: 20.0001 }
            )
        ).toBe(false);
        expect(
            coordinatesEqual(
                { latitude: 10, longitude: 20 },
                { latitude: 10.0001, longitude: 20 }
            )
        ).toBe(false);
    });

    it("treats longitude -180 and 180 as the same meridian", () => {
        expect(
            coordinatesEqual(
                { latitude: 5, longitude: -180 },
                { latitude: 5, longitude: 180 }
            )
        ).toBe(true);
    });

    it("compares longitude around the antimeridian with a tolerance", () => {
        const a = { latitude: 0, longitude: 179.9999 };
        const b = { latitude: 0, longitude: -179.9999 };
        expect(coordinatesEqual(a, b)).toBe(false);
        expect(coordinatesEqual(a, b, 0.001)).toBe(true);
        expect(coordinatesEqual(a, b, 0.0001)).toBe(false);
    });

    it("ignores longitude at the same pole", () => {
        expect(
            coordinatesEqual(
                { latitude: 90, longitude: 10 },
                { latitude: 90, longitude: -120 }
            )
        ).toBe(true);
        expect(
            coordinatesEqual(
                { latitude: -90, longitude: 0 },
                { latitude: -90, longitude: 180 }
            )
        ).toBe(true);
        expect(
            coordinatesEqual(
                { latitude: 90, longitude: 0 },
                { latitude: -90, longitude: 0 }
            )
        ).toBe(false);
    });

    it("applies the tolerance to each axis independently", () => {
        const a = { latitude: 10, longitude: 20 };
        expect(
            coordinatesEqual(a, { latitude: 10.25, longitude: 19.75 }, 0.25)
        ).toBe(true);
        expect(
            coordinatesEqual(a, { latitude: 10.5, longitude: 20 }, 0.25)
        ).toBe(false);
    });

    it("accepts DMS input", () => {
        expect(
            coordinatesEqual(
                {
                    latitude: {
                        degrees: 12,
                        minutes: 30,
                        seconds: 0,
                        direction: "S",
                    },
                    longitude: {
                        degrees: 180,
                        minutes: 0,
                        seconds: 0,
                        direction: "W",
                    },
                },
                { latitude: -12.5, longitude: 180 }
            )
        ).toBe(true);
    });

    it("rejects invalid tolerance and coordinates", () => {
        const p = { latitude: 0, longitude: 0 };
        expect(() => coordinatesEqual(p, p, -1)).toThrow(RangeError);
        expect(() => coordinatesEqual(p, p, Number.NaN)).toThrow(TypeError);
        expect(() => coordinatesEqual(p, p, "1" as never)).toThrow(TypeError);
        expect(() =>
            coordinatesEqual(p, { latitude: 91, longitude: 0 })
        ).toThrow(RangeError);
        expect(() => coordinatesEqual(null as never, p)).toThrow(TypeError);
    });
});
