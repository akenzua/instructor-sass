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
import { SchoolsService } from "./schools.service";
import { CreateSchoolDto, UpdateSchoolDto, InviteInstructorDto, UpdateInstructorRoleDto } from "./dto/school.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SchoolRoleGuard } from "./guards/school-role.guard";
import { Roles } from "./decorators/roles.decorator";

@Controller("schools")
@UseGuards(JwtAuthGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  async create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateSchoolDto,
  ) {
    return this.schoolsService.create(req.user.id, dto);
  }

  @Get("mine")
  async getMySchool(@Request() req: { user: { id: string } }) {
    return this.schoolsService.findByInstructorId(req.user.id);
  }

  @Put(":id")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateSchoolDto,
    @Request() req: { schoolId: string },
  ) {
    return this.schoolsService.update(req.schoolId, dto);
  }

  @Post(":id/invitations")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async inviteInstructor(
    @Body() dto: InviteInstructorDto,
    @Request() req: { user: { id: string }; schoolId: string },
  ) {
    return this.schoolsService.inviteInstructor(req.schoolId, dto, req.user.id);
  }

  @Get(":id/invitations")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async listInvitations(@Request() req: { schoolId: string }) {
    return this.schoolsService.listInvitations(req.schoolId);
  }

  @Delete(":id/invitations/:invitationId")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async cancelInvitation(
    @Param("invitationId") invitationId: string,
    @Request() req: { schoolId: string },
  ) {
    return this.schoolsService.cancelInvitation(req.schoolId, invitationId);
  }

  @Get(":id/instructors")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async listInstructors(@Request() req: { schoolId: string }) {
    return this.schoolsService.listInstructors(req.schoolId);
  }

  @Put(":id/instructors/:instructorId/role")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner")
  async updateInstructorRole(
    @Param("instructorId") instructorId: string,
    @Body() dto: UpdateInstructorRoleDto,
    @Request() req: { user: { id: string }; schoolId: string },
  ) {
    return this.schoolsService.updateInstructorRole(
      req.schoolId,
      instructorId,
      dto,
      req.user.id,
    );
  }

  @Delete(":id/instructors/:instructorId")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async removeInstructor(
    @Param("instructorId") instructorId: string,
    @Request() req: { user: { id: string }; schoolId: string },
  ) {
    return this.schoolsService.removeInstructor(req.schoolId, instructorId, req.user.id);
  }

  @Get(":id/instructors/:instructorId/detail")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async getInstructorDetail(
    @Param("instructorId") instructorId: string,
    @Request() req: { schoolId: string },
  ) {
    return this.schoolsService.getInstructorDetail(req.schoolId, instructorId);
  }

  @Get(":id/instructors/:instructorId/learners")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async getInstructorLearners(
    @Param("instructorId") instructorId: string,
    @Request() req: { schoolId: string },
  ) {
    return this.schoolsService.getInstructorLearners(req.schoolId, instructorId);
  }

  @Get(":id/instructors/:instructorId/learners/:learnerId")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async getInstructorLearnerDetail(
    @Param("instructorId") instructorId: string,
    @Param("learnerId") learnerId: string,
    @Request() req: { schoolId: string },
  ) {
    return this.schoolsService.getInstructorLearnerDetail(req.schoolId, instructorId, learnerId);
  }

  @Get(":id/dashboard")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async getDashboard(@Request() req: { schoolId: string }) {
    return this.schoolsService.getDashboard(req.schoolId);
  }

  // ============================================================================
  // School-level Packages
  // ============================================================================

  @Post(":id/packages")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async createSchoolPackage(
    @Body() dto: any,
    @Request() req: { schoolId: string },
  ) {
    return this.schoolsService.createSchoolPackage(req.schoolId, dto);
  }

  @Get(":id/packages")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async listSchoolPackages(@Request() req: { schoolId: string }) {
    return this.schoolsService.findSchoolPackages(req.schoolId);
  }

  @Put(":id/packages/:packageId")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async updateSchoolPackage(
    @Param("packageId") packageId: string,
    @Body() dto: any,
    @Request() req: { schoolId: string },
  ) {
    return this.schoolsService.updateSchoolPackage(req.schoolId, packageId, dto);
  }

  @Delete(":id/packages/:packageId")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async deleteSchoolPackage(
    @Param("packageId") packageId: string,
    @Request() req: { schoolId: string },
  ) {
    return this.schoolsService.deleteSchoolPackage(req.schoolId, packageId);
  }

  // ============================================================================
  // School-level Syllabus
  // ============================================================================

  @Post(":id/syllabus")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async createSchoolSyllabus(
    @Body() dto: any,
    @Request() req: { schoolId: string },
  ) {
    return this.schoolsService.createSchoolSyllabus(req.schoolId, dto);
  }

  @Get(":id/syllabus")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async listSchoolSyllabus(@Request() req: { schoolId: string }) {
    return this.schoolsService.findSchoolSyllabus(req.schoolId);
  }

  @Put(":id/syllabus/:syllabusId")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async updateSchoolSyllabus(
    @Param("syllabusId") syllabusId: string,
    @Body() dto: any,
    @Request() req: { schoolId: string },
  ) {
    return this.schoolsService.updateSchoolSyllabus(req.schoolId, syllabusId, dto);
  }

  @Delete(":id/syllabus/:syllabusId")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async deleteSchoolSyllabus(
    @Param("syllabusId") syllabusId: string,
    @Request() req: { schoolId: string },
  ) {
    return this.schoolsService.deleteSchoolSyllabus(req.schoolId, syllabusId);
  }

  // ============================================================================
  // School Policies
  // ============================================================================

  @Get(":id/policies")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async getSchoolPolicies(@Request() req: { schoolId: string }) {
    return this.schoolsService.getSchoolPolicies(req.schoolId);
  }

  @Put(":id/policies")
  @UseGuards(SchoolRoleGuard)
  @Roles("owner", "admin")
  async updateSchoolPolicies(
    @Body() dto: any,
    @Request() req: { schoolId: string },
  ) {
    return this.schoolsService.updateSchoolPolicies(req.schoolId, dto);
  }
}
