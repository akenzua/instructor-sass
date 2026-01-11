"use client";

import { useMemo, Fragment, type ReactNode } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Grid,
  GridItem,
  Button,
  type BoxProps,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  getDay,
} from "date-fns";

export interface CalendarEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  color?: string;
}

export interface AvailabilitySlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface DayAvailability {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  isAvailable: boolean;
  slots: AvailabilitySlot[];
}

export interface WeekCalendarProps extends Omit<BoxProps, "children"> {
  /** Currently selected/focused date */
  currentDate: Date;
  /** Events to display */
  events?: CalendarEvent[];
  /** Availability data for the week */
  availability?: DayAvailability[];
  /** Callback when navigating to previous week */
  onPrevWeek?: () => void;
  /** Callback when navigating to next week */
  onNextWeek?: () => void;
  /** Callback to go to today */
  onToday?: () => void;
  /** Callback when an event is clicked */
  onEventClick?: (event: CalendarEvent) => void;
  /** Callback when a time slot is clicked */
  onSlotClick?: (date: Date) => void;
  /** Start hour of the day (0-23) */
  startHour?: number;
  /** End hour of the day (0-23) */
  endHour?: number;
  /** Custom render function for events */
  renderEvent?: (event: CalendarEvent) => ReactNode;
}

/**
 * WeekCalendar displays a week view with time slots and events.
 */
export function WeekCalendar({
  currentDate,
  events = [],
  availability = [],
  onPrevWeek,
  onNextWeek,
  onToday,
  onEventClick,
  onSlotClick,
  startHour = 6,
  endHour = 22,
  renderEvent,
  ...props
}: WeekCalendarProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const dayKey = format(event.start, "yyyy-MM-dd");
      const existing = map.get(dayKey) || [];
      map.set(dayKey, [...existing, event]);
    });
    return map;
  }, [events]);

  // Convert availability to a map by day number
  const availabilityByDay = useMemo(() => {
    const map = new Map<number, DayAvailability>();
    availability.forEach((av) => {
      map.set(av.dayOfWeek, av);
    });
    return map;
  }, [availability]);

  // Check if a specific hour is within available slots for a day
  const isHourAvailable = (dayNum: number, hour: number): boolean => {
    const dayAvail = availabilityByDay.get(dayNum);
    if (!dayAvail || !dayAvail.isAvailable) return false;
    
    return dayAvail.slots.some((slot) => {
      const slotStartHour = parseInt(slot.start.split(":")[0], 10);
      const slotEndHour = parseInt(slot.end.split(":")[0], 10);
      return hour >= slotStartHour && hour < slotEndHour;
    });
  };

  const getEventStyle = (event: CalendarEvent) => {
    const eventMinutes = event.start.getMinutes();
    const durationMinutes =
      (event.end.getTime() - event.start.getTime()) / (1000 * 60);

    // Top is only the minutes offset within the hour cell (since event is rendered in the correct hour cell)
    const top = eventMinutes; // pixels for minutes offset within the hour
    const height = Math.max(durationMinutes, 20); // Minimum 20px height

    return { top: `${top}px`, height: `${height}px` };
  };

  const handleSlotClick = (day: Date, hour: number) => {
    const clickedDate = new Date(day);
    clickedDate.setHours(hour, 0, 0, 0);
    onSlotClick?.(clickedDate);
  };

  return (
    <Box bg="bg.surface" borderRadius="lg" overflow="hidden" {...props}>
      {/* Header */}
      <Flex align="center" justify="space-between" p={4} borderBottom="1px solid" borderColor="border.subtle">
        <Flex align="center" gap={2}>
          <IconButton
            aria-label="Previous week"
            icon={<ChevronLeft size={20} />}
            variant="ghost"
            size="sm"
            onClick={onPrevWeek}
          />
          <IconButton
            aria-label="Next week"
            icon={<ChevronRight size={20} />}
            variant="ghost"
            size="sm"
            onClick={onNextWeek}
          />
          <Button size="sm" variant="outline" onClick={onToday}>
            Today
          </Button>
        </Flex>
        <Text fontWeight="semibold">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </Text>
        <Box w="120px" /> {/* Spacer for alignment */}
      </Flex>

      {/* Calendar grid */}
      <Box overflow="auto" maxH="calc(100vh - 250px)">
        <Grid templateColumns="60px repeat(7, 1fr)" minW="800px">
          {/* Day headers */}
          <GridItem />
          {days.map((day) => (
            <GridItem
              key={day.toISOString()}
              textAlign="center"
              py={2}
              borderBottom="1px solid"
              borderColor="border.subtle"
              bg={isToday(day) ? "primary.50" : undefined}
              _dark={{ bg: isToday(day) ? "primary.900" : undefined }}
            >
              <Text fontSize="xs" color="fg.muted" textTransform="uppercase">
                {format(day, "EEE")}
              </Text>
              <Text
                fontWeight={isToday(day) ? "bold" : "medium"}
                color={isToday(day) ? "primary.500" : "fg.default"}
              >
                {format(day, "d")}
              </Text>
            </GridItem>
          ))}

          {/* Time rows */}
          {hours.map((hour) => (
            <Fragment key={hour}>
              {/* Time label */}
              <GridItem
                py={2}
                px={2}
                textAlign="right"
                borderRight="1px solid"
                borderBottom="1px solid"
                borderColor="border.subtle"
                h="60px"
              >
                <Text fontSize="xs" color="fg.muted">
                  {format(new Date().setHours(hour, 0), "HH:mm")}
                </Text>
              </GridItem>

              {/* Day columns */}
              {days.map((day) => {
                const dayKey = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDay.get(dayKey) || [];
                const hourEvents = dayEvents.filter(
                  (e) => e.start.getHours() === hour
                );
                // getDay returns 0 for Sunday, 1 for Monday, etc.
                const dayNum = getDay(day);
                const isAvailable = isHourAvailable(dayNum, hour);

                return (
                  <GridItem
                    key={`${dayKey}-${hour}`}
                    position="relative"
                    borderRight="1px solid"
                    borderBottom="1px solid"
                    borderColor="border.subtle"
                    h="60px"
                    cursor={isAvailable ? "pointer" : "not-allowed"}
                    bg={isAvailable ? "green.50" : "gray.50"}
                    _dark={{
                      bg: isAvailable ? "green.900" : "gray.800",
                    }}
                    _hover={isAvailable ? { bg: "green.100", _dark: { bg: "green.800" } } : {}}
                    onClick={() => isAvailable && handleSlotClick(day, hour)}
                  >
                    {hourEvents.map((event) => {
                      const style = getEventStyle(event);
                      const colorScheme = event.color || "primary";
                      return (
                        <Box
                          key={event.id}
                          position="absolute"
                          left="2px"
                          right="2px"
                          top={style.top}
                          h={style.height}
                          bg={`${colorScheme}.500`}
                          borderRadius="sm"
                          px={1}
                          py={0.5}
                          overflow="hidden"
                          cursor="pointer"
                          zIndex={1}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                          _hover={{ opacity: 0.9 }}
                        >
                          {renderEvent ? (
                            renderEvent(event)
                          ) : (
                            <Text fontSize="xs" color="white" fontWeight="medium" noOfLines={2}>
                              {event.title}
                            </Text>
                          )}
                        </Box>
                      );
                    })}
                  </GridItem>
                );
              })}
            </Fragment>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

WeekCalendar.displayName = "WeekCalendar";
