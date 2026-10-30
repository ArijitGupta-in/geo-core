/** @arijitgupta/geo-core — public API. */
export type {
    Bounds,
    Coordinate,
    CoordinateInput,
    DMSCoordinate,
    DMSOptions,
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
    decimalToDMS,
    degreesToRadians,
    dmsToDecimal,
    latitudeDMSToDecimal,
    latitudeToDMS,
    longitudeDMSToDecimal,
    longitudeToDMS,
    radiansToDegrees,
} from "./conversion.js";

export { coordinatesEqual } from "./equality.js";

export {
    normalizeAngle,
    normalizeCoordinate,
    normalizeLongitude,
} from "./normalization.js";

export {
    isCoordinate,
    isDMSCoordinate,
    validateBounds,
    validateCoordinate,
    validateDMSCoordinate,
    validateLatitudeDMS,
    validateLongitudeDMS,
} from "./validation.js";
