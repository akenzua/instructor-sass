import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lesson, LessonSchema } from '../../schemas/lesson.schema';
import { Learner, LearnerSchema } from '../../schemas/learner.schema';
import { Instructor, InstructorSchema } from '../../schemas/instructor.schema';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: Learner.name, schema: LearnerSchema },
      { name: Instructor.name, schema: InstructorSchema },
    ]),
  ],
  providers: [CalendarService],
  controllers: [CalendarController],
  exports: [CalendarService],
})
export class CalendarModule {}
