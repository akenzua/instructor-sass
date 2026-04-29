import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Instructor, InstructorDocument } from "../../../schemas/instructor.schema";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class SchoolRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException("Authentication required");
    }

    const instructor = await this.instructorModel.findById(userId).select("schoolId role").lean();

    if (!instructor || !instructor.schoolId || !instructor.role) {
      throw new ForbiddenException("You must belong to a school to access this resource");
    }

    if (!requiredRoles.includes(instructor.role)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    // Attach school info to request for downstream use
    request.schoolId = instructor.schoolId.toString();
    request.schoolRole = instructor.role;

    return true;
  }
}
