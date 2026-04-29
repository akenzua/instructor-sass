import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Vehicle, VehicleSchema } from "../../schemas/vehicle.schema";
import { VehicleAssignment, VehicleAssignmentSchema } from "../../schemas/vehicle-assignment.schema";
import { Instructor, InstructorSchema } from "../../schemas/instructor.schema";
import { VehiclesService } from "./vehicles.service";
import { VehiclesController } from "./vehicles.controller";
import { SchoolRoleGuard } from "../schools/guards/school-role.guard";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vehicle.name, schema: VehicleSchema },
      { name: VehicleAssignment.name, schema: VehicleAssignmentSchema },
      { name: Instructor.name, schema: InstructorSchema },
    ]),
  ],
  providers: [VehiclesService, SchoolRoleGuard],
  controllers: [VehiclesController],
  exports: [VehiclesService],
})
export class VehiclesModule {}
