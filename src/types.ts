/** A geographic coordinate expressed in decimal degrees. */
export interface Coordinate {
    /** Latitude in degrees, ranging from -90 to 90. */
    latitude: number;
    /** Longitude in degrees, ranging from -180 to 180. */
    longitude: number;
}

/** Cardinal direction for latitude. */
export type LatitudeDirection = "N" | "S";
/** Cardinal direction for longitude. */
export type LongitudeDirection = "E" | "W";

/** A latitude value in Degrees, Minutes, Seconds format. */
export interface LatitudeDMS {
    degrees: number;
    minutes: number;
    seconds: number;
    direction: LatitudeDirection;
}

/** A longitude value in Degrees, Minutes, Seconds format. */
export interface LongitudeDMS {
    degrees: number;
    minutes: number;
    seconds: number;
    direction: LongitudeDirection;
}

/** A geographic coordinate expressed in Degrees, Minutes, Seconds format. */
export interface DMSCoordinate {
    latitude: LatitudeDMS;
    longitude: LongitudeDMS;
}

/**
 * A geographic bounding box. Longitudes are circular, so west > east
 * represents a box crossing the antimeridian. Latitude requires south <= north.
 */
export interface Bounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

/** Coordinate input accepted by APIs supporting decimal degrees and DMS. */
export type CoordinateInput = Coordinate | DMSCoordinate;
