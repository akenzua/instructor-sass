import { Injectable, Logger } from "@nestjs/common";

interface PostcodeResult {
  postcode: string;
  latitude: number;
  longitude: number;
  admin_district: string; // e.g., "Westminster"
  region: string; // e.g., "London"
  country: string;
  outcode: string; // e.g., "SW1A" from "SW1A 1AA"
}

interface PostcodesIoResponse {
  status: number;
  result: PostcodeResult | null;
}

interface PostcodesIoBulkResponse {
  status: number;
  result: Array<{
    query: string;
    result: PostcodeResult | null;
  }>;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  formattedLocation: string;
  postcode?: string;
  outcode?: string;
}

@Injectable()
export class PostcodeService {
  private readonly logger = new Logger(PostcodeService.name);
  private readonly baseUrl = "https://api.postcodes.io";

  /**
   * Look up a full UK postcode (e.g., "SW1A 1AA")
   */
  async lookupPostcode(postcode: string): Promise<GeoLocation | null> {
    try {
      const cleanPostcode = postcode.replace(/\s+/g, "").toUpperCase();
      const response = await fetch(
        `${this.baseUrl}/postcodes/${encodeURIComponent(cleanPostcode)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Not a valid postcode, try as outcode
          return this.lookupOutcode(postcode);
        }
        return null;
      }

      const data: PostcodesIoResponse = await response.json();
      if (!data.result) return null;

      return {
        latitude: data.result.latitude,
        longitude: data.result.longitude,
        formattedLocation: `${data.result.admin_district}, ${data.result.region}`,
        postcode: data.result.postcode,
        outcode: data.result.outcode,
      };
    } catch (error) {
      this.logger.error(`Failed to lookup postcode ${postcode}:`, error);
      return null;
    }
  }

  /**
   * Look up a partial postcode / outcode (e.g., "SW1A", "M1", "B1")
   */
  async lookupOutcode(outcode: string): Promise<GeoLocation | null> {
    try {
      const cleanOutcode = outcode.replace(/\s+/g, "").toUpperCase();
      const response = await fetch(
        `${this.baseUrl}/outcodes/${encodeURIComponent(cleanOutcode)}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (!data.result) return null;

      // Outcode returns slightly different structure
      const result = data.result;
      const adminDistrict = result.admin_district?.[0] || result.parish?.[0] || cleanOutcode;
      const region = result.admin_county?.[0] || result.country?.[0] || "";

      return {
        latitude: result.latitude,
        longitude: result.longitude,
        formattedLocation: region ? `${adminDistrict}, ${region}` : adminDistrict,
        outcode: cleanOutcode,
      };
    } catch (error) {
      this.logger.error(`Failed to lookup outcode ${outcode}:`, error);
      return null;
    }
  }

  /**
   * Validate and geocode a location string
   * Attempts to detect if it's a postcode, outcode, or place name
   */
  async geocodeLocation(location: string): Promise<GeoLocation | null> {
    if (!location || location.trim().length === 0) {
      return null;
    }

    const trimmed = location.trim();

    // UK postcode patterns
    // Full: "SW1A 1AA", "M1 1AA", "B1 1AA"
    // Outcode: "SW1A", "M1", "B1", "EC1A"
    const fullPostcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
    const outcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?$/i;

    // Try full postcode first
    if (fullPostcodePattern.test(trimmed)) {
      const result = await this.lookupPostcode(trimmed);
      if (result) return result;
    }

    // Try outcode
    if (outcodePattern.test(trimmed)) {
      const result = await this.lookupOutcode(trimmed);
      if (result) return result;
    }

    // Could also be an outcode without proper format, try anyway
    const possibleOutcode = trimmed.replace(/\s+/g, "").toUpperCase();
    if (possibleOutcode.length <= 4) {
      const result = await this.lookupOutcode(possibleOutcode);
      if (result) return result;
    }

    // Not a postcode - return null (will fall back to text search)
    return null;
  }

  /**
   * Calculate distance between two coordinates in miles
   * Uses Haversine formula
   */
  calculateDistanceMiles(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Convert miles to meters (for MongoDB $geoNear)
   */
  milesToMeters(miles: number): number {
    return miles * 1609.344;
  }
}
