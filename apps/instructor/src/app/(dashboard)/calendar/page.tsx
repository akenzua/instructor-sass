"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Skeleton,
  useDisclosure,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react";
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from "date-fns";
import { WeekCalendar, PageHeader } from "@acme/ui";
import type { CalendarEvent, DayAvailability } from "@acme/ui";
import { useLessons, useWeeklyAvailability } from "@/hooks";
import { LessonDrawer, CreateLessonModal } from "@/components";
import type { Lesson } from "@acme/shared";

const statusColorMap: Record<string, string> = {
  scheduled: "primary",
  completed: "green",
  cancelled: "red",
  "no-show": "orange",
};

// Map day names to JS day numbers (Sunday = 0, Monday = 1, etc.)
const dayNameToNumber: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);
  const drawer = useDisclosure();
  const createModal = useDisclosure();

  // Calculate week range
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Fetch lessons for the current week
  const { data: lessonsData, isLoading: lessonsLoading } = useLessons({
    from: weekStart.toISOString(),
    to: weekEnd.toISOString(),
  });

  // Fetch weekly availability
  const { data: weeklyAvailability, isLoading: availabilityLoading } = useWeeklyAvailability();

  // Transform lessons to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    if (!lessonsData?.items) return [];

    return lessonsData.items.map((lesson) => {
      // Get learner name from the populated learner object
      const learnerName = lesson.learner 
        ? `${lesson.learner.firstName || ''} ${lesson.learner.lastName || ''}`.trim() 
        : 'Unknown Learner';
      
      return {
        id: lesson._id,
        title: learnerName || 'Lesson',
        start: new Date(lesson.startTime),
        end: new Date(lesson.endTime),
        color: statusColorMap[lesson.status] || 'primary',
      };
    });
  }, [lessonsData]);

  // Transform availability data for calendar
  const availability: DayAvailability[] = useMemo(() => {
    if (!weeklyAvailability) return [];

    return weeklyAvailability.map((day) => ({
      dayOfWeek: dayNameToNumber[day.dayOfWeek.toLowerCase()] ?? 0,
      isAvailable: day.isAvailable,
      slots: day.slots || [],
    }));
  }, [weeklyAvailability]);

  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    const lesson = lessonsData?.items.find((l) => l._id === event.id);
    if (lesson) {
      setSelectedLesson(lesson);
      drawer.onOpen();
    }
  };

  const handleSlotClick = (date: Date) => {
    setSelectedSlotDate(date);
    createModal.onOpen();
  };

  const isLoading = lessonsLoading || availabilityLoading;

  return (
    <>
      <VStack spacing={6} align="stretch" h="full">
        <PageHeader
          title="Calendar"
          description={`Week of ${format(weekStart, "MMMM d")} - ${format(weekEnd, "MMMM d, yyyy")}`}
        />

        {/* Legend */}
        <HStack spacing={4} flexWrap="wrap">
          <HStack spacing={2}>
            <Box w={3} h={3} bg="green.100" borderRadius="sm" />
            <Text fontSize="sm" color="fg.muted">Available</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={3} h={3} bg="gray.100" borderRadius="sm" />
            <Text fontSize="sm" color="fg.muted">Unavailable</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={3} h={3} bg="primary.500" borderRadius="sm" />
            <Text fontSize="sm" color="fg.muted">Scheduled</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={3} h={3} bg="green.500" borderRadius="sm" />
            <Text fontSize="sm" color="fg.muted">Completed</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={3} h={3} bg="red.500" borderRadius="sm" />
            <Text fontSize="sm" color="fg.muted">Cancelled</Text>
          </HStack>
        </HStack>

        {!weeklyAvailability?.length && !availabilityLoading && (
          <Box p={4} bg="orange.50" borderRadius="md" _dark={{ bg: "orange.900" }}>
            <Text color="orange.700" _dark={{ color: "orange.200" }}>
              No availability set. Go to{" "}
              <Text
                as="span"
                fontWeight="bold"
                cursor="pointer"
                textDecoration="underline"
                onClick={() => router.push("/availability")}
              >
                Availability
              </Text>{" "}
              to set your working hours.
            </Text>
          </Box>
        )}

        {isLoading ? (
          <Skeleton height="600px" borderRadius="lg" />
        ) : (
          <Box
            bg="bg.surface"
            borderRadius="lg"
            border="1px solid"
            borderColor="border.subtle"
            overflow="hidden"
            flex={1}
            minH="600px"
          >
            <WeekCalendar
              currentDate={currentDate}
              events={events}
              availability={availability}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onToday={handleToday}
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
              startHour={6}
              endHour={22}
            />
          </Box>
        )}
      </VStack>

      <LessonDrawer
        lesson={selectedLesson}
        isOpen={drawer.isOpen}
        onClose={() => {
          drawer.onClose();
          setSelectedLesson(null);
        }}
      />

      <CreateLessonModal
        isOpen={createModal.isOpen}
        onClose={() => {
          createModal.onClose();
          setSelectedSlotDate(null);
        }}
        selectedDate={selectedSlotDate}
      />
    </>
  );
}
