import { MINUTES_PER_DEGREE, SECONDS_PER_DEGREE } from "./constants.js";

/** Sums DMS components into an unsigned decimal-degree magnitude. */
export function dmsToMagnitude(value: {
    degrees: number;
    minutes: number;
    seconds: number;
}): number {
    return (
        value.degrees +
        value.minutes / MINUTES_PER_DEGREE +
        value.seconds / SECONDS_PER_DEGREE
    );
}
