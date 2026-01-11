"use client";

import {
  Box,
  Flex,
  Text,
  type BoxProps,
} from "@chakra-ui/react";

export type BookingSlotStatus =
  | "available"
  | "booked"
  | "pending"
  | "blocked"
  | "past";

export interface BookingSlotProps extends BoxProps {
  /** Start time display */
  startTime: string;
  /** End time display */
  endTime: string;
  /** Status of the slot */
  status?: BookingSlotStatus;
  /** Title/learner name */
  title?: string;
  /** Subtitle/lesson type */
  subtitle?: string;
  /** Whether the slot is selectable */
  isSelectable?: boolean;
  /** Callback when clicked */
  onClick?: () => void;
}

const statusStyles: Record<
  BookingSlotStatus,
  { bg: string; borderColor: string; color: string }
> = {
  available: {
    bg: "success.subtle",
    borderColor: "success.default",
    color: "success.700",
  },
  booked: {
    bg: "accent.subtle",
    borderColor: "accent.default",
    color: "accent.700",
  },
  pending: {
    bg: "warning.subtle",
    borderColor: "warning.default",
    color: "warning.800",
  },
  blocked: {
    bg: "bg.subtle",
    borderColor: "border.default",
    color: "fg.muted",
  },
  past: {
    bg: "bg.subtle",
    borderColor: "border.muted",
    color: "fg.subtle",
  },
};

/**
 * BookingSlot displays a visual block representing a time slot in a schedule.
 */
export function BookingSlot({
  startTime,
  endTime,
  status = "available",
  title,
  subtitle,
  isSelectable = true,
  onClick,
  ...props
}: BookingSlotProps) {
  const styles = statusStyles[status];
  const isClickable = isSelectable && status !== "past" && onClick;

  return (
    <Box
      bg={styles.bg}
      borderLeft="4px solid"
      borderColor={styles.borderColor}
      borderRadius="md"
      p={3}
      cursor={isClickable ? "pointer" : "default"}
      onClick={isClickable ? onClick : undefined}
      transition="all 0.2s"
      _hover={
        isClickable
          ? {
              transform: "translateY(-1px)",
              boxShadow: "sm",
            }
          : undefined
      }
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          onClick?.();
        }
      }}
      {...props}
    >
      <Flex justify="space-between" align="flex-start">
        <Box>
          {title && (
            <Text fontWeight="semibold" color={styles.color} fontSize="sm">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text color={styles.color} fontSize="xs" opacity={0.8}>
              {subtitle}
            </Text>
          )}
        </Box>
        <Text fontSize="xs" color={styles.color} fontWeight="medium">
          {startTime} - {endTime}
        </Text>
      </Flex>
    </Box>
  );
}

BookingSlot.displayName = "BookingSlot";
