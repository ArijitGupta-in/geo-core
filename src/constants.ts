/** Minimum valid latitude in decimal degrees. */
export const MIN_LATITUDE = -90;
/** Maximum valid latitude in decimal degrees. */
export const MAX_LATITUDE = 90;
/** Minimum valid longitude in decimal degrees. */
export const MIN_LONGITUDE = -180;
/** Maximum valid longitude in decimal degrees. */
export const MAX_LONGITUDE = 180;
/** Number of degrees in a complete circle. */
export const DEGREES_PER_CIRCLE = 360;
/** Number of minutes in one degree. */
export const MINUTES_PER_DEGREE = 60;
/** Number of seconds in one minute. */
export const SECONDS_PER_MINUTE = 60;
/** Number of seconds in one degree. */
export const SECONDS_PER_DEGREE = MINUTES_PER_DEGREE * SECONDS_PER_MINUTE;
/** Multiply degrees by this value to obtain radians. */
export const RADIANS_PER_DEGREE = Math.PI / 180;
/** Multiply radians by this value to obtain degrees. */
export const DEGREES_PER_RADIAN = 180 / Math.PI;
/** Mean spherical Earth radius in meters; not an ellipsoid parameter. */
export const MEAN_EARTH_RADIUS_METERS = 6_371_000;
