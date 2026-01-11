"use client";

import {
  Box,
  Flex,
  Text,
  VStack,
  Divider,
  type BoxProps,
} from "@chakra-ui/react";
import { BookingSlot, type BookingSlotStatus } from "./BookingSlot";
import { EmptyState } from "../layout/EmptyState";
import { Calendar } from "lucide-react";

export interface ScheduleItem {
  id: string;
  startTime: string;
  endTime: string;
  status: BookingSlotStatus;
  title?: string;
  subtitle?: string;
}

export interface ScheduleDay {
  date: string;
  dayLabel: string;
  items: ScheduleItem[];
}

export interface ScheduleListProps extends Omit<BoxProps, "children"> {
  /** Schedule data grouped by day */
  days: ScheduleDay[];
  /** Callback when a slot is clicked */
  onSlotClick?: (item: ScheduleItem) => void;
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state description */
  emptyDescription?: string;
  /** Whether to show date headers */
  showDateHeaders?: boolean;
}

/**
 * ScheduleList displays a list view of scheduled items grouped by day.
 * Ideal for mobile views or when a calendar grid isn't needed.
 */
export function ScheduleList({
  days,
  onSlotClick,
  emptyTitle = "No scheduled items",
  emptyDescription = "There are no lessons or appointments scheduled for this period.",
  showDateHeaders = true,
  ...props
}: ScheduleListProps) {
  const hasItems = days.some((day) => day.items.length > 0);

  if (!hasItems) {
    return (
      <EmptyState
        icon={Calendar}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <VStack spacing={0} align="stretch" divider={<Divider />} {...props}>
      {days.map((day) => {
        if (day.items.length === 0) return null;

        return (
          <Box key={day.date} py={4}>
            {showDateHeaders && (
              <Flex
                align="baseline"
                gap={2}
                mb={3}
                position="sticky"
                top={0}
                bg="bg.canvas"
                py={1}
              >
                <Text fontWeight="semibold" color="fg.default">
                  {day.dayLabel}
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  {day.date}
                </Text>
              </Flex>
            )}
            <VStack spacing={2} align="stretch">
              {day.items.map((item) => (
                <BookingSlot
                  key={item.id}
                  startTime={item.startTime}
                  endTime={item.endTime}
                  status={item.status}
                  title={item.title}
                  subtitle={item.subtitle}
                  onClick={
                    onSlotClick ? () => onSlotClick(item) : undefined
                  }
                />
              ))}
            </VStack>
          </Box>
        );
      })}
    </VStack>
  );
}

ScheduleList.displayName = "ScheduleList";
