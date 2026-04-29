import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Vehicle, VehicleDocument } from "../../schemas/vehicle.schema";
import { VehicleAssignment, VehicleAssignmentDocument } from "../../schemas/vehicle-assignment.schema";
import { Instructor, InstructorDocument } from "../../schemas/instructor.schema";
import { CreateVehicleDto, UpdateVehicleDto, AssignVehicleDto } from "./dto/vehicle.dto";

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    @InjectModel(VehicleAssignment.name) private assignmentModel: Model<VehicleAssignmentDocument>,
    @InjectModel(Instructor.name) private instructorModel: Model<InstructorDocument>,
  ) {}

  async create(schoolId: string, dto: CreateVehicleDto): Promise<VehicleDocument> {
    const existing = await this.vehicleModel.findOne({ registration: dto.registration.toUpperCase() });
    if (existing) {
      throw new ConflictException("A vehicle with this registration already exists");
    }

    return this.vehicleModel.create({
      ...dto,
      registration: dto.registration.toUpperCase(),
      schoolId: new Types.ObjectId(schoolId),
    });
  }

  async findAllBySchool(schoolId: string) {
    const vehicles = await this.vehicleModel
      .find({ schoolId: new Types.ObjectId(schoolId) })
      .sort({ status: 1, make: 1, model: 1 })
      .lean();

    // Attach active assignments for each vehicle
    const vehicleIds = vehicles.map((v) => v._id);
    const assignments = await this.assignmentModel
      .find({ vehicleId: { $in: vehicleIds }, status: "active" })
      .populate("instructorId", "firstName lastName email")
      .lean();

    const assignmentMap = new Map<string, typeof assignments>();
    for (const a of assignments) {
      const key = a.vehicleId.toString();
      if (!assignmentMap.has(key)) assignmentMap.set(key, []);
      assignmentMap.get(key)!.push(a);
    }

    return vehicles.map((v) => ({
      ...v,
      assignments: assignmentMap.get(v._id.toString()) || [],
    }));
  }

  async findById(vehicleId: string, schoolId: string): Promise<VehicleDocument> {
    const vehicle = await this.vehicleModel.findOne({
      _id: new Types.ObjectId(vehicleId),
      schoolId: new Types.ObjectId(schoolId),
    });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    return vehicle;
  }

  async update(vehicleId: string, schoolId: string, dto: UpdateVehicleDto): Promise<VehicleDocument> {
    if (dto.registration) {
      const existing = await this.vehicleModel.findOne({
        registration: dto.registration.toUpperCase(),
        _id: { $ne: new Types.ObjectId(vehicleId) },
      });
      if (existing) {
        throw new ConflictException("A vehicle with this registration already exists");
      }
      dto.registration = dto.registration.toUpperCase();
    }

    const vehicle = await this.vehicleModel.findOneAndUpdate(
      { _id: new Types.ObjectId(vehicleId), schoolId: new Types.ObjectId(schoolId) },
      { $set: dto },
      { new: true },
    );
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    return vehicle;
  }

  async remove(vehicleId: string, schoolId: string) {
    const vehicle = await this.vehicleModel.findOneAndUpdate(
      { _id: new Types.ObjectId(vehicleId), schoolId: new Types.ObjectId(schoolId) },
      { $set: { status: "retired" } },
      { new: true },
    );
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    // End all active assignments
    await this.assignmentModel.updateMany(
      { vehicleId: new Types.ObjectId(vehicleId), status: "active" },
      { $set: { status: "ended" } },
    );

    return { message: "Vehicle retired" };
  }

  async assignToInstructor(vehicleId: string, schoolId: string, dto: AssignVehicleDto) {
    // Verify instructor belongs to this school
    const instructor = await this.instructorModel.findOne({
      _id: new Types.ObjectId(dto.instructorId),
      schoolId: new Types.ObjectId(schoolId),
    });
    if (!instructor) {
      throw new NotFoundException("Instructor not found in this school");
    }

    // Verify vehicle belongs to this school
    const vehicle = await this.vehicleModel.findOne({
      _id: new Types.ObjectId(vehicleId),
      schoolId: new Types.ObjectId(schoolId),
      status: "active",
    });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found or not active");
    }

    // Check if assignment already exists
    const existing = await this.assignmentModel.findOne({
      vehicleId: new Types.ObjectId(vehicleId),
      instructorId: new Types.ObjectId(dto.instructorId),
      status: "active",
    });
    if (existing) {
      throw new ConflictException("This vehicle is already assigned to this instructor");
    }

    // If isPrimary, unset other primaries for this instructor
    if (dto.isPrimary) {
      await this.assignmentModel.updateMany(
        { instructorId: new Types.ObjectId(dto.instructorId), status: "active" },
        { $set: { isPrimary: false } },
      );
    }

    return this.assignmentModel.create({
      vehicleId: new Types.ObjectId(vehicleId),
      instructorId: new Types.ObjectId(dto.instructorId),
      schoolId: new Types.ObjectId(schoolId),
      isPrimary: dto.isPrimary ?? false,
    });
  }

  async unassignFromInstructor(vehicleId: string, instructorId: string, schoolId: string) {
    const assignment = await this.assignmentModel.findOneAndUpdate(
      {
        vehicleId: new Types.ObjectId(vehicleId),
        instructorId: new Types.ObjectId(instructorId),
        schoolId: new Types.ObjectId(schoolId),
        status: "active",
      },
      { $set: { status: "ended" } },
      { new: true },
    );
    if (!assignment) {
      throw new NotFoundException("Assignment not found");
    }
    return { message: "Vehicle unassigned" };
  }

  async listAssignments(schoolId: string) {
    return this.assignmentModel
      .find({ schoolId: new Types.ObjectId(schoolId), status: "active" })
      .populate("vehicleId", "make model registration transmission status")
      .populate("instructorId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();
  }

  async listByInstructor(instructorId: string) {
    const assignments = await this.assignmentModel
      .find({ instructorId: new Types.ObjectId(instructorId), status: "active" })
      .populate("vehicleId")
      .sort({ isPrimary: -1, createdAt: -1 })
      .lean();

    return assignments.map((a) => ({
      ...a.vehicleId,
      assignmentId: a._id,
      isPrimary: a.isPrimary,
    }));
  }
}
