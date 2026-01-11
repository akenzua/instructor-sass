"use client";

import { VStack } from "@chakra-ui/react";
import { LessonCard } from "@acme/ui";
import type { Lesson } from "@acme/shared";
import { format } from "date-fns";

interface UpcomingLessonsProps {
  lessons: Lesson[];
  onLessonClick?: (lesson: Lesson) => void;
}

export function UpcomingLessons({ lessons, onLessonClick }: UpcomingLessonsProps) {
  return (
    <VStack spacing={3} align="stretch">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson._id}
          learnerName={lesson.learner ? `${lesson.learner.firstName || ''} ${lesson.learner.lastName || ''}`.trim() : "Unknown Learner"}
          type={lesson.type}
          startTime={format(new Date(lesson.startTime), "h:mm a")}
          endTime={format(new Date(lesson.endTime), "h:mm a")}
          duration={lesson.duration}
          status={lesson.status}
          paymentStatus={lesson.paymentStatus}
          price={lesson.price}
          pickupLocation={lesson.pickupLocation}
          onClick={() => onLessonClick?.(lesson)}
        />
      ))}
    </VStack>
  );
}
