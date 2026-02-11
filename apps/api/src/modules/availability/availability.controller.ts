import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AvailabilityService } from "./availability.service";
import {
  UpdateWeeklyAvailabilityDto,
  CreateOverrideDto,
  OverrideQueryDto,
} from "./dto/availability.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("availability")
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  async getWeekly(@Request() req: { user: { id: string } }) {
    return this.availabilityService.getWeeklyAvailability(req.user.id);
  }

  @Put()
  async updateWeekly(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateWeeklyAvailabilityDto[]
  ) {
    return this.availabilityService.updateWeeklyAvailability(req.user.id, dto);
  }

  @Post('reset')
  async resetToDefaults(@Request() req: { user: { id: string } }) {
    return this.availabilityService.resetToDefaults(req.user.id);
  }

  @Get("overrides")
  async getOverrides(
    @Request() req: { user: { id: string } },
    @Query() query: OverrideQueryDto
  ) {
    return this.availabilityService.getOverrides(
      req.user.id,
      query.from,
      query.to
    );
  }

  @Post("overrides")
  async createOverride(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateOverrideDto
  ) {
    return this.availabilityService.createOverride(req.user.id, dto);
  }

  @Delete("overrides/:date")
  async deleteOverride(
    @Request() req: { user: { id: string } },
    @Param("date") date: string
  ) {
    return this.availabilityService.deleteOverride(req.user.id, date);
  }
}
