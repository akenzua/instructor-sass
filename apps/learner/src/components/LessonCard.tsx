"use client";

import { useMemo } from "react";
import {
  Badge,
  Box,
  Divider,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@acme/ui";
import type { PopulatedLesson } from "@/types";
import { isPopulatedInstructor } from "@/types";
import { isLessonUrgent, isLessonToday, formatLessonType } from "@/lib/utils";

interface LessonCardProps {
  lesson: PopulatedLesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  const startTime = useMemo(
    () => new Date(lesson.startTime),
    [lesson.startTime]
  );
  const endTime = useMemo(
    () => new Date(lesson.endTime),
    [lesson.endTime]
  );

  const urgent = isLessonUrgent(startTime);
  const today = isLessonToday(startTime);

  return (
    <Box
      as="li"
      p={4}
      borderRadius="lg"
      border={urgent ? "2px solid" : "1px solid"}
      borderColor={
        urgent ? "orange.400" : today ? "blue.200" : "border.subtle"
      }
      bg={urgent ? "orange.50" : "bg.surface"}
      _dark={{
        bg: urgent ? "orange.900" : undefined,
      }}
      listStyleType="none"
    >
      {urgent && (
        <Badge colorScheme="orange" mb={2}>
          Starting soon
        </Badge>
      )}
      <HStack justify="space-between" mb={2}>
        <VStack align="start" spacing={0}>
          <Text fontWeight="semibold">
            {format(startTime, "EEEE, MMMM d")}
          </Text>
          <Text fontSize="sm" color="text.muted">
            {formatDistanceToNow(startTime, { addSuffix: true })}
          </Text>
        </VStack>
        <StatusBadge status={lesson.status} />
      </HStack>

      <Divider my={2} />

      <VStack align="start" spacing={2}>
        <HStack color="text.muted" fontSize="sm">
          <Clock size={14} aria-hidden="true" />
          <Text>
            {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
          </Text>
        </HStack>

        <HStack color="text.muted" fontSize="sm">
          <Calendar size={14} aria-hidden="true" />
          <Badge colorScheme="blue" size="sm">
            {formatLessonType(lesson.type)}
          </Badge>
          <Text>• {lesson.duration} mins</Text>
        </HStack>

        {lesson.pickupLocation && (
          <HStack color="text.muted" fontSize="sm">
            <MapPin size={14} aria-hidden="true" />
            <Text>{lesson.pickupLocation}</Text>
          </HStack>
        )}

        {isPopulatedInstructor(lesson.instructorId) && (
          <HStack color="text.muted" fontSize="sm">
            <Text fontWeight="medium">
              Instructor: {lesson.instructorId.firstName}{" "}
              {lesson.instructorId.lastName}
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}
