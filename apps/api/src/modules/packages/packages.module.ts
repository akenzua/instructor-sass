import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Package, PackageSchema } from "../../schemas/package.schema";
import { Instructor, InstructorSchema } from "../../schemas/instructor.schema";
import { PackagesService } from "./packages.service";
import { PackagesController } from "./packages.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Package.name, schema: PackageSchema },
      { name: Instructor.name, schema: InstructorSchema },
    ]),
  ],
  providers: [PackagesService],
  controllers: [PackagesController],
  exports: [PackagesService],
})
export class PackagesModule {}
