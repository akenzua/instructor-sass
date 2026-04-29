import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { VehiclesService } from "./vehicles.service";
import { CreateVehicleDto, UpdateVehicleDto, AssignVehicleDto } from "./dto/vehicle.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SchoolRoleGuard } from "../schools/guards/school-role.guard";
import { Roles } from "../schools/decorators/roles.decorator";

@Controller("vehicles")
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async create(
    @Body() dto: CreateVehicleDto,
    @Request() req: { schoolId: string },
  ) {
    return this.vehiclesService.create(req.schoolId, dto);
  }

  @Get()
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin", "instructor")
  async findAll(@Request() req: { schoolId: string }) {
    return this.vehiclesService.findAllBySchool(req.schoolId);
  }

  @Get("assignments")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async listAssignments(@Request() req: { schoolId: string }) {
    return this.vehiclesService.listAssignments(req.schoolId);
  }

  @Get("mine")
  async listMyVehicles(@Request() req: { user: { id: string } }) {
    return this.vehiclesService.listByInstructor(req.user.id);
  }

  @Get(":id")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin", "instructor")
  async findOne(
    @Param("id") id: string,
    @Request() req: { schoolId: string },
  ) {
    return this.vehiclesService.findById(id, req.schoolId);
  }

  @Put(":id")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateVehicleDto,
    @Request() req: { schoolId: string },
  ) {
    return this.vehiclesService.update(id, req.schoolId, dto);
  }

  @Delete(":id")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async remove(
    @Param("id") id: string,
    @Request() req: { schoolId: string },
  ) {
    return this.vehiclesService.remove(id, req.schoolId);
  }

  @Post(":id/assign")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async assign(
    @Param("id") id: string,
    @Body() dto: AssignVehicleDto,
    @Request() req: { schoolId: string },
  ) {
    return this.vehiclesService.assignToInstructor(id, req.schoolId, dto);
  }

  @Delete(":id/assign/:instructorId")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async unassign(
    @Param("id") vehicleId: string,
    @Param("instructorId") instructorId: string,
    @Request() req: { schoolId: string },
  ) {
    return this.vehiclesService.unassignFromInstructor(vehicleId, instructorId, req.schoolId);
  }
}
