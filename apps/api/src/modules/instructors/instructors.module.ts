import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Instructor, InstructorSchema } from "../../schemas/instructor.schema";
import { InstructorsService } from "./instructors.service";
import { InstructorsController } from "./instructors.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Instructor.name, schema: InstructorSchema },
    ]),
  ],
  providers: [InstructorsService],
  controllers: [InstructorsController],
  exports: [InstructorsService],
})
export class InstructorsModule {}
