import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { InstructorSearchService } from "./instructor-search.service";

@Controller("search")
export class InstructorSearchController {
  constructor(private readonly searchService: InstructorSearchService) {}

  /**
   * GET /search/instructors?postcode=SW1A+1AA&radius=10&transmission=manual&sortBy=distance
   * Public — no authentication required.
   */
  @Get("instructors")
  async searchInstructors(
    @Query("postcode") postcode?: string,
    @Query("lat") lat?: string,
    @Query("lng") lng?: string,
    @Query("radius") radius?: string,
    @Query("transmission") transmission?: string,
    @Query("lessonType") lessonType?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("language") language?: string,
    @Query("sortBy") sortBy?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    let coordinates: [number, number] | undefined;

    // Resolve postcode to coordinates
    if (postcode) {
      const resolved = await this.searchService.resolvePostcode(postcode);
      if (resolved) {
        coordinates = [resolved.lng, resolved.lat]; // GeoJSON = [lng, lat]
      }
    } else if (lat && lng) {
      coordinates = [parseFloat(lng), parseFloat(lat)];
    }

    return this.searchService.searchInstructors({
      coordinates,
      radius: radius ? parseFloat(radius) : undefined,
      transmission,
      lessonType,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      language,
      sortBy,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * GET /search/instructors/:usernameOrId — public profile page
   */
  @Get("instructors/:usernameOrId")
  async getInstructorProfile(@Param("usernameOrId") usernameOrId: string) {
    return this.searchService.getInstructorProfile(usernameOrId);
  }

  /**
   * GET /search/postcode/:postcode — resolve UK postcode to lat/lng
   */
  @Get("postcode/:postcode")
  async resolvePostcode(@Param("postcode") postcode: string) {
    const result = await this.searchService.resolvePostcode(postcode);
    if (!result) {
      throw new NotFoundException("Postcode not found");
    }
    return result;
  }
}
