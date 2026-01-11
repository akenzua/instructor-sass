import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Package, PackageSchema } from "../../schemas/package.schema";
import { PackagesService } from "./packages.service";
import { PackagesController } from "./packages.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }]),
  ],
  providers: [PackagesService],
  controllers: [PackagesController],
  exports: [PackagesService],
})
export class PackagesModule {}
