import { describe, expect, it } from "vitest";
import {
    decimalToDMS,
    dmsToDecimal,
    latitudeToDMS,
    longitudeToDMS,
} from "../src/index.js";

describe("decimal to DMS conversion", () => {
    it("converts a decimal coordinate to DMS", () => {
        expect(decimalToDMS({ latitude: 22.5726, longitude: 88.3639 })).toEqual(
            {
                latitude: {
                    degrees: 22,
                    minutes: 34,
                    seconds: 21.36,
                    direction: "N",
                },
                longitude: {
                    degrees: 88,
                    minutes: 21,
                    seconds: 50.04,
                    direction: "E",
                },
            }
        );
    });

    it("uses S and W for negative values", () => {
        expect(latitudeToDMS(-12.5)).toEqual({
            degrees: 12,
            minutes: 30,
            seconds: 0,
            direction: "S",
        });
        expect(longitudeToDMS(-0.5)).toEqual({
            degrees: 0,
            minutes: 30,
            seconds: 0,
            direction: "W",
        });
    });

    it("keeps zero in the positive hemisphere", () => {
        expect(latitudeToDMS(-0).direction).toBe("N");
        expect(longitudeToDMS(0).direction).toBe("E");
        expect(latitudeToDMS(-1e-12)).toEqual({
            degrees: 0,
            minutes: 0,
            seconds: 0,
            direction: "N",
        });
    });

    it("handles range limits", () => {
        expect(latitudeToDMS(90)).toEqual({
            degrees: 90,
            minutes: 0,
            seconds: 0,
            direction: "N",
        });
        expect(longitudeToDMS(-180)).toEqual({
            degrees: 180,
            minutes: 0,
            seconds: 0,
            direction: "W",
        });
    });

    it("carries rounded seconds into minutes and degrees", () => {
        expect(latitudeToDMS(10 + 59 / 60 + 59.9999999 / 3600)).toEqual({
            degrees: 11,
            minutes: 0,
            seconds: 0,
            direction: "N",
        });
        expect(latitudeToDMS(89.9999999999)).toMatchObject({
            degrees: 90,
            minutes: 0,
            seconds: 0,
        });
    });

    it("honors fractionDigits", () => {
        expect(latitudeToDMS(22.5726, { fractionDigits: 0 }).seconds).toBe(21);
        expect(latitudeToDMS(22.5726, { fractionDigits: 1 }).seconds).toBe(
            21.4
        );
        const precise = latitudeToDMS(0.123456789, { fractionDigits: 9 });
        expect(precise.minutes).toBe(7);
        expect(precise.seconds).toBeCloseTo(24.4444404, 9);
    });

    it("rejects invalid fractionDigits", () => {
        expect(() => latitudeToDMS(1, { fractionDigits: 1.5 })).toThrow(
            TypeError
        );
        expect(() => latitudeToDMS(1, { fractionDigits: -1 })).toThrow(
            RangeError
        );
        expect(() => latitudeToDMS(1, { fractionDigits: 10 })).toThrow(
            RangeError
        );
    });

    it("rejects invalid values", () => {
        expect(() => latitudeToDMS(91)).toThrow(RangeError);
        expect(() => latitudeToDMS(Number.NaN)).toThrow(TypeError);
        expect(() => longitudeToDMS(181)).toThrow(RangeError);
        expect(() => longitudeToDMS("1" as never)).toThrow(TypeError);
        expect(() => decimalToDMS({ latitude: 0, longitude: 200 })).toThrow(
            RangeError
        );
        expect(() => decimalToDMS(null as never)).toThrow(TypeError);
    });

    it("round-trips through dmsToDecimal", () => {
        for (const [latitude, longitude] of [
            [22.5726, 88.3639],
            [-33.8688, 151.2093],
            [0, 0],
            [45.1, -122.987654],
            [-89.999999, 179.999999],
        ] as const) {
            const back = dmsToDecimal(decimalToDMS({ latitude, longitude }));
            expect(back.latitude).toBeCloseTo(latitude, 9);
            expect(back.longitude).toBeCloseTo(longitude, 9);
        }
    });
});
