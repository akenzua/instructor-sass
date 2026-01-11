import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Package, PackageDocument } from "../../schemas/package.schema";
import { CreatePackageDto, UpdatePackageDto } from "./dto/package.dto";

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(Package.name)
    private packageModel: Model<PackageDocument>
  ) {}

  async create(
    instructorId: string,
    dto: CreatePackageDto
  ): Promise<PackageDocument> {
    return this.packageModel.create({
      ...dto,
      instructorId,
    });
  }

  async findAll(instructorId: string): Promise<PackageDocument[]> {
    return this.packageModel.find({ instructorId }).sort({ createdAt: -1 });
  }

  async findActive(instructorId: string): Promise<PackageDocument[]> {
    return this.packageModel
      .find({ instructorId, isActive: true })
      .sort({ price: 1 });
  }

  async findById(instructorId: string, id: string): Promise<PackageDocument> {
    const pkg = await this.packageModel.findOne({ _id: id, instructorId });
    if (!pkg) {
      throw new NotFoundException("Package not found");
    }
    return pkg;
  }

  async update(
    instructorId: string,
    id: string,
    dto: UpdatePackageDto
  ): Promise<PackageDocument> {
    const pkg = await this.packageModel.findOneAndUpdate(
      { _id: id, instructorId },
      { $set: dto },
      { new: true }
    );
    if (!pkg) {
      throw new NotFoundException("Package not found");
    }
    return pkg;
  }

  async delete(instructorId: string, id: string): Promise<void> {
    const result = await this.packageModel.deleteOne({ _id: id, instructorId });
    if (result.deletedCount === 0) {
      throw new NotFoundException("Package not found");
    }
  }
}
