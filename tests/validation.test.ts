import { describe, expect, it } from "vitest";
import { validateBounds, validateCoordinate, validateDMSCoordinate } from "../src/index.js";

describe("coordinate validation", () => {
    it("accepts boundary coordinates", () => {
        expect(() => validateCoordinate({ latitude: -90, longitude: 180 })).not.toThrow();
        expect(() => validateCoordinate({ latitude: 90, longitude: -180 })).not.toThrow();
    });

    it("rejects non-finite and out-of-range decimal coordinates", () => {
        expect(() => validateCoordinate({ latitude: Number.NaN, longitude: 0 })).toThrow(TypeError);
        expect(() => validateCoordinate({ latitude: 91, longitude: 0 })).toThrow(RangeError);
        expect(() => validateCoordinate({ latitude: 0, longitude: 181 })).toThrow(RangeError);
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

    it("allows antimeridian-crossing bounds", () => {
        expect(() => validateBounds({ north: 10, south: -10, west: 170, east: -170 })).not.toThrow();
    });

    it("rejects inverted latitude bounds", () => {
        expect(() => validateBounds({ north: -10, south: 10, west: -20, east: 20 })).toThrow(RangeError);
    });
});
