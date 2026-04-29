import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Syllabus,
  SyllabusDocument,
  LearnerProgress,
  LearnerProgressDocument,
} from "../../schemas/syllabus.schema";
import { Instructor, InstructorDocument } from "../../schemas/instructor.schema";
import { Lesson, LessonDocument } from "../../schemas/lesson.schema";
import {
  CreateSyllabusDto,
  UpdateSyllabusDto,
  ScoreTopicDto,
  CompleteTopicDto,
  InitProgressDto,
} from "./dto/syllabus.dto";
import { DEFAULT_DVSA_SYLLABUS } from "./default-syllabus";

@Injectable()
export class SyllabusService {
  constructor(
    @InjectModel(Syllabus.name) private syllabusModel: Model<SyllabusDocument>,
    @InjectModel(LearnerProgress.name) private progressModel: Model<LearnerProgressDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Instructor.name) private instructorModel: Model<InstructorDocument>,
  ) {}

  private async getSchoolId(instructorId: string): Promise<Types.ObjectId | null> {
    const inst = await this.instructorModel.findById(instructorId).select('schoolId').lean();
    return inst?.schoolId ? new Types.ObjectId(inst.schoolId as any) : null;
  }

  // ============================================================================
  // Syllabus CRUD
  // ============================================================================

  async create(instructorId: string, dto: CreateSyllabusDto) {
    const oid = new Types.ObjectId(instructorId);

    // If marking as default, unset other defaults
    if (dto.isDefault) {
      await this.syllabusModel.updateMany(
        { instructorId: oid, isDefault: true },
        { isDefault: false },
      );
    }

    return this.syllabusModel.create({
      ...dto,
      instructorId: oid,
    });
  }

  async findAll(instructorId: string) {
    const oid = new Types.ObjectId(instructorId);
    const schoolId = await this.getSchoolId(instructorId);
    const filter = schoolId
      ? { $or: [{ instructorId: oid }, { schoolId }] }
      : { instructorId: oid };
    return this.syllabusModel
      .find(filter)
      .sort({ isDefault: -1, createdAt: -1 });
  }

  async findById(instructorId: string, id: string) {
    const syllabus = await this.syllabusModel.findOne({
      _id: new Types.ObjectId(id),
      instructorId: new Types.ObjectId(instructorId),
    });
    if (!syllabus) throw new NotFoundException("Syllabus not found");
    return syllabus;
  }

  async getDefault(instructorId: string) {
    const oid = new Types.ObjectId(instructorId);
    let syllabus = await this.syllabusModel.findOne({
      instructorId: oid,
      isDefault: true,
    });

    // Check school-level default if instructor doesn't have one
    if (!syllabus) {
      const schoolId = await this.getSchoolId(instructorId);
      if (schoolId) {
        syllabus = await this.syllabusModel.findOne({
          schoolId,
          isDefault: true,
        });
      }
    }

    // Auto-seed the default DVSA syllabus if none exists
    if (!syllabus) {
      syllabus = await this.syllabusModel.create({
        ...DEFAULT_DVSA_SYLLABUS,
        instructorId: oid,
        isDefault: true,
      });
    }

    return syllabus;
  }

  async update(instructorId: string, id: string, dto: UpdateSyllabusDto) {
    const oid = new Types.ObjectId(instructorId);

    if (dto.isDefault) {
      await this.syllabusModel.updateMany(
        { instructorId: oid, isDefault: true, _id: { $ne: new Types.ObjectId(id) } },
        { isDefault: false },
      );
    }

    const syllabus = await this.syllabusModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), instructorId: oid },
      dto,
      { new: true },
    );
    if (!syllabus) throw new NotFoundException("Syllabus not found");
    return syllabus;
  }

  async delete(instructorId: string, id: string) {
    const result = await this.syllabusModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      instructorId: new Types.ObjectId(instructorId),
    });
    if (!result) throw new NotFoundException("Syllabus not found");
    return { deleted: true };
  }

  // ============================================================================
  // Learner Progress
  // ============================================================================

  async initProgress(instructorId: string, dto: InitProgressDto) {
    const oid = new Types.ObjectId(instructorId);
    const learnerId = new Types.ObjectId(dto.learnerId);

    // Get the syllabus (specified or default)
    let syllabus: SyllabusDocument;
    if (dto.syllabusId) {
      syllabus = await this.syllabusModel.findOne({
        _id: new Types.ObjectId(dto.syllabusId),
        instructorId: oid,
      });
    } else {
      syllabus = await this.getDefault(instructorId);
    }
    if (!syllabus) throw new NotFoundException("Syllabus not found");

    // Check if progress already exists
    const existing = await this.progressModel.findOne({
      learnerId,
      syllabusId: syllabus._id,
    });
    if (existing) return existing;

    // Create progress with all topics set to not-started
    const topicProgress = syllabus.topics.map((t) => ({
      topicOrder: t.order,
      status: "not-started" as const,
      currentScore: 0,
      attempts: 0,
      history: [],
    }));

    return this.progressModel.create({
      learnerId,
      instructorId: oid,
      syllabusId: syllabus._id,
      topicProgress,
    });
  }

  async getProgress(instructorId: string, learnerId: string, autoInit = true) {
    let progress = await this.progressModel
      .findOne({
        instructorId: new Types.ObjectId(instructorId),
        learnerId: new Types.ObjectId(learnerId),
      })
      .sort({ updatedAt: -1 });

    // Auto-initialise progress from the default syllabus when first accessed
    if (!progress && autoInit) {
      progress = await this.initProgress(instructorId, { learnerId });
    }

    if (!progress) return null;

    // Populate the syllabus for topic names
    const syllabus = await this.syllabusModel.findById(progress.syllabusId);
    return { progress, syllabus };
  }

  async getAllProgress(instructorId: string) {
    return this.progressModel.find({
      instructorId: new Types.ObjectId(instructorId),
    });
  }

  async scoreTopic(instructorId: string, dto: ScoreTopicDto) {
    const oid = new Types.ObjectId(instructorId);
    const learnerId = new Types.ObjectId(dto.learnerId);

    // Find learner's progress — auto-init if none exists
    let progress = await this.progressModel.findOne({
      instructorId: oid,
      learnerId,
    });
    if (!progress) {
      progress = await this.initProgress(instructorId, { learnerId: dto.learnerId });
    }
    if (!progress) {
      throw new NotFoundException(
        "Could not initialise progress. Ensure a default syllabus exists.",
      );
    }

    // Find the topic in progress
    const topicIdx = progress.topicProgress.findIndex(
      (tp) => tp.topicOrder === dto.topicOrder,
    );
    if (topicIdx === -1) {
      throw new BadRequestException(`Topic order ${dto.topicOrder} not found in syllabus`);
    }

    const topic = progress.topicProgress[topicIdx];
    topic.currentScore = dto.score;
    topic.attempts += 1;
    if (topic.status === "not-started") {
      topic.status = "in-progress";
    }
    topic.history.push({
      lessonId: new Types.ObjectId(dto.lessonId),
      date: new Date(),
      score: dto.score,
      notes: dto.notes,
    });

    progress.topicProgress[topicIdx] = topic;
    await progress.save();

    // Also update the lesson with the topic info
    const syllabus = await this.syllabusModel.findById(progress.syllabusId);
    const syllabusTopicTitle = syllabus?.topics.find(
      (t) => t.order === dto.topicOrder,
    )?.title;

    await this.lessonModel.findOneAndUpdate(
      { _id: new Types.ObjectId(dto.lessonId), instructorId: oid },
      {
        syllabusId: progress.syllabusId,
        topicOrder: dto.topicOrder,
        topicTitle: syllabusTopicTitle || `Topic ${dto.topicOrder}`,
        topicScore: dto.score,
        topicNotes: dto.notes,
      },
    );

    return progress;
  }

  async completeTopic(instructorId: string, dto: CompleteTopicDto) {
    const oid = new Types.ObjectId(instructorId);
    const learnerId = new Types.ObjectId(dto.learnerId);

    const progress = await this.progressModel.findOne({
      instructorId: oid,
      learnerId,
    });
    if (!progress) {
      throw new NotFoundException("No progress record found");
    }

    const topicIdx = progress.topicProgress.findIndex(
      (tp) => tp.topicOrder === dto.topicOrder,
    );
    if (topicIdx === -1) {
      throw new BadRequestException(`Topic order ${dto.topicOrder} not found`);
    }

    progress.topicProgress[topicIdx].status = "completed";
    progress.topicProgress[topicIdx].completedAt = new Date();
    await progress.save();

    return progress;
  }

  async reopenTopic(instructorId: string, learnerId: string, topicOrder: number) {
    const progress = await this.progressModel.findOne({
      instructorId: new Types.ObjectId(instructorId),
      learnerId: new Types.ObjectId(learnerId),
    });
    if (!progress) throw new NotFoundException("No progress record found");

    const topicIdx = progress.topicProgress.findIndex(
      (tp) => tp.topicOrder === topicOrder,
    );
    if (topicIdx === -1) throw new BadRequestException(`Topic ${topicOrder} not found`);

    progress.topicProgress[topicIdx].status = "in-progress";
    progress.topicProgress[topicIdx].completedAt = undefined;
    await progress.save();

    return progress;
  }
}
