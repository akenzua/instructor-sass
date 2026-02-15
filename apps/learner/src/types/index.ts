import type { Lesson } from "@acme/shared";

/**
 * Represents a populated instructor reference from Mongoose.
 * When a lesson's instructorId is populated, it becomes this object
 * instead of a plain ObjectId string.
 */
export interface PopulatedInstructor {
  _id: string;
  firstName: string;
  lastName: string;
}

/**
 * A lesson with potentially populated instructor data.
 * The API may return instructorId as either a string (ObjectId)
 * or as a populated instructor object.
 */
export type PopulatedLesson = Omit<Lesson, "instructorId"> & {
  instructorId: string | PopulatedInstructor;
};

/**
 * Type guard to check if an instructor field has been populated
 * by Mongoose with full instructor data.
 */
export function isPopulatedInstructor(
  instructor: string | PopulatedInstructor
): instructor is PopulatedInstructor {
  return (
    typeof instructor === "object" &&
    instructor !== null &&
    "firstName" in instructor
  );
}
