"use client";

import { useMemo } from "react";
import {
  Badge,
  Box,
  Card,
  CardBody,
  Divider,
  Heading,
  HStack,
  SkeletonText,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@acme/ui";
import type { PopulatedLesson } from "@/types";
import { isLessonUrgent, formatLessonType } from "@/lib/utils";
import { EmptyLessons } from "./EmptyLessons";

interface NextLessonCardProps {
  lesson: PopulatedLesson | null;
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function NextLessonCard({
  lesson,
  isLoading,
  error,
  onRetry,
}: NextLessonCardProps) {
  const startTime = useMemo(
    () => (lesson ? new Date(lesson.startTime) : null),
    [lesson?.startTime]
  );
  const endTime = useMemo(
    () => (lesson ? new Date(lesson.endTime) : null),
    [lesson?.endTime]
  );

  const urgent = startTime ? isLessonUrgent(startTime) : false;

  return (
    <Card>
      <CardBody>
        <Heading size="sm" mb={4}>
          Next Lesson
        </Heading>

        {isLoading ? (
          <SkeletonText noOfLines={3} spacing={3} />
        ) : error ? (
          <Box py={4} textAlign="center">
            <Text color="red.500" fontSize="sm" mb={2}>
              We couldn&apos;t load your lessons.
            </Text>
            {onRetry && (
              <Text
                as="button"
                color="primary.500"
                fontSize="sm"
                fontWeight="medium"
                cursor="pointer"
                onClick={onRetry}
                _hover={{ textDecoration: "underline" }}
              >
                Try again
              </Text>
            )}
          </Box>
        ) : lesson && startTime && endTime ? (
          <Box>
            {urgent && (
              <Badge colorScheme="orange" mb={3}>
                Starting soon
              </Badge>
            )}
            <HStack justify="space-between" mb={4}>
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="semibold">
                  {format(startTime, "EEEE, MMMM d")}
                </Text>
                <Text color="text.muted">
                  {formatDistanceToNow(startTime, { addSuffix: true })}
                </Text>
              </VStack>
              <StatusBadge status={lesson.status} />
            </HStack>

            <Divider mb={4} />

            <VStack align="start" spacing={3}>
              <HStack color="text.muted">
                <Clock size={16} aria-hidden="true" />
                <Text>
                  {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                </Text>
              </HStack>

              <HStack color="text.muted">
                <Calendar size={16} aria-hidden="true" />
                <Badge colorScheme="blue">
                  {formatLessonType(lesson.type)}
                </Badge>
              </HStack>

              {lesson.pickupLocation && (
                <HStack color="text.muted">
                  <MapPin size={16} aria-hidden="true" />
                  <Text>{lesson.pickupLocation}</Text>
                </HStack>
              )}
            </VStack>
          </Box>
        ) : (
          <EmptyLessons />
        )}
      </CardBody>
    </Card>
  );
}
