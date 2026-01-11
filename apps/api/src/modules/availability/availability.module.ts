import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  WeeklyAvailability,
  WeeklyAvailabilitySchema,
  AvailabilityOverride,
  AvailabilityOverrideSchema,
} from "../../schemas/availability.schema";
import { AvailabilityService } from "./availability.service";
import { AvailabilityController } from "./availability.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeeklyAvailability.name, schema: WeeklyAvailabilitySchema },
      { name: AvailabilityOverride.name, schema: AvailabilityOverrideSchema },
    ]),
  ],
  providers: [AvailabilityService],
  controllers: [AvailabilityController],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
