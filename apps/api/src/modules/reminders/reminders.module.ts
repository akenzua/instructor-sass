import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lesson, LessonSchema } from '../../schemas/lesson.schema';
import { RemindersService } from './reminders.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
  ],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}
