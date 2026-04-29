import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { School, SchoolSchema } from "../../schemas/school.schema";
import { Instructor, InstructorSchema } from "../../schemas/instructor.schema";
import { Lesson, LessonSchema } from "../../schemas/lesson.schema";
import { Payment, PaymentSchema } from "../../schemas/payment.schema";
import {
  SchoolInvitation,
  SchoolInvitationSchema,
} from "../../schemas/school-invitation.schema";
import { Package, PackageSchema } from "../../schemas/package.schema";
import { Syllabus, SyllabusSchema } from "../../schemas/syllabus.schema";
import { Learner, LearnerSchema } from "../../schemas/learner.schema";
import {
  LearnerInstructorLink,
  LearnerInstructorLinkSchema,
} from "../../schemas/learner-instructor-link.schema";
import {
  LearnerProgress,
  LearnerProgressSchema,
} from "../../schemas/syllabus.schema";
import { SchoolsService } from "./schools.service";
import { SchoolsController } from "./schools.controller";
import { SchoolRoleGuard } from "./guards/school-role.guard";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: School.name, schema: SchoolSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: SchoolInvitation.name, schema: SchoolInvitationSchema },
      { name: Package.name, schema: PackageSchema },
      { name: Syllabus.name, schema: SyllabusSchema },
      { name: Learner.name, schema: LearnerSchema },
      { name: LearnerInstructorLink.name, schema: LearnerInstructorLinkSchema },
      { name: LearnerProgress.name, schema: LearnerProgressSchema },
    ]),
    EmailModule,
  ],
  providers: [SchoolsService, SchoolRoleGuard],
  controllers: [SchoolsController],
  exports: [SchoolsService],
})
export class SchoolsModule {}
