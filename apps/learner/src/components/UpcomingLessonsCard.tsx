"use client";

import { Card, CardBody, Heading, VStack } from "@chakra-ui/react";
import type { PopulatedLesson } from "@/types";
import { LessonCard } from "./LessonCard";

interface UpcomingLessonsCardProps {
  lessons: PopulatedLesson[];
}

export function UpcomingLessonsCard({ lessons }: UpcomingLessonsCardProps) {
  if (lessons.length <= 1) return null;

  return (
    <Card>
      <CardBody>
        <Heading size="sm" mb={4}>
          Upcoming Lessons
        </Heading>
        <VStack
          as="ul"
          spacing={4}
          align="stretch"
          listStyleType="none"
          m={0}
          p={0}
        >
          {lessons.slice(1).map((lesson) => (
            <LessonCard key={lesson._id} lesson={lesson} />
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
}
