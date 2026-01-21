import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Instructor, InstructorDocument } from "../../schemas/instructor.schema";
import { UpdateInstructorDto } from "./dto/instructor.dto";

@Injectable()
export class InstructorsService {
  constructor(
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>
  ) {}

  async findById(id: string): Promise<InstructorDocument> {
    const instructor = await this.instructorModel.findById(id);
    if (!instructor) {
      throw new NotFoundException("Instructor not found");
    }
    return instructor;
  }

  async update(id: string, dto: UpdateInstructorDto): Promise<InstructorDocument> {
    const instructor = await this.instructorModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true }
    );
    if (!instructor) {
      throw new NotFoundException("Instructor not found");
    }
    return instructor;
  }

  async isUsernameAvailable(username: string, excludeId?: string): Promise<boolean> {
    const normalizedUsername = username.toLowerCase();
    
    // Reserved usernames
    const reserved = [
      "www", "app", "api", "admin", "instructor", "learner",
      "dashboard", "blog", "help", "support", "settings", "login",
      "signup", "register", "account", "profile", "user", "users",
    ];
    
    if (reserved.includes(normalizedUsername)) {
      return false;
    }

    const query: Record<string, unknown> = { username: normalizedUsername };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await this.instructorModel.findOne(query);
    return !existing;
  }
}
