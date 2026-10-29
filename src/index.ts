/** @arijitgupta/geo-core — public API. */
export type {
    Bounds,
    Coordinate,
    CoordinateInput,
    DMSCoordinate,
    LatitudeDMS,
    LatitudeDirection,
    LongitudeDMS,
    LongitudeDirection,
} from "./types.js";

export {
    DEGREES_PER_CIRCLE,
    DEGREES_PER_RADIAN,
    MAX_LATITUDE,
    MAX_LONGITUDE,
    MEAN_EARTH_RADIUS_METERS,
    MIN_LATITUDE,
    MIN_LONGITUDE,
    MINUTES_PER_DEGREE,
    RADIANS_PER_DEGREE,
    SECONDS_PER_DEGREE,
    SECONDS_PER_MINUTE,
} from "./constants.js";

export {
    degreesToRadians,
    dmsToDecimal,
    latitudeDMSToDecimal,
    longitudeDMSToDecimal,
    radiansToDegrees,
} from "./conversion.js";

export { normalizeAngle, normalizeCoordinate, normalizeLongitude } from "./normalization.js";

export {
    isCoordinate,
    isDMSCoordinate,
    validateBounds,
    validateCoordinate,
    validateDMSCoordinate,
} from "./validation.js";
