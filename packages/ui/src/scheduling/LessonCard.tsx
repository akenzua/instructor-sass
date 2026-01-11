"use client";

import { forwardRef } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  IconButton,
  type BoxProps,
} from "@chakra-ui/react";
import { Clock, MapPin, MoreVertical, User } from "lucide-react";

export type LessonStatus = "scheduled" | "completed" | "cancelled" | "no-show";
export type PaymentStatus = "pending" | "paid" | "refunded" | "waived";

export interface LessonCardProps extends Omit<BoxProps, "onClick"> {
  /** Learner name */
  learnerName: string;
  /** Start time display string */
  startTime: string;
  /** End time display string */
  endTime: string;
  /** Duration in minutes */
  duration: number;
  /** Lesson type */
  type?: string;
  /** Lesson status */
  status: LessonStatus;
  /** Payment status */
  paymentStatus: PaymentStatus;
  /** Price in currency */
  price: number;
  /** Pickup location */
  pickupLocation?: string;
  /** Show compact version */
  compact?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Menu click handler */
  onMenuClick?: () => void;
}

const statusColors: Record<LessonStatus, string> = {
  scheduled: "accent",
  completed: "success",
  cancelled: "danger",
  "no-show": "warning",
};

const paymentColors: Record<PaymentStatus, string> = {
  pending: "warning",
  paid: "success",
  refunded: "accent",
  waived: "gray",
};

/**
 * LessonCard displays a lesson with learner info, time, status, and payment info.
 */
export const LessonCard = forwardRef<HTMLDivElement, LessonCardProps>(
  (
    {
      learnerName,
      startTime,
      endTime,
      duration,
      type = "standard",
      status,
      paymentStatus,
      price,
      pickupLocation,
      compact = false,
      onClick,
      onMenuClick,
      ...props
    },
    ref
  ) => {
    const statusColor = statusColors[status];
    const paymentColor = paymentColors[paymentStatus];

    if (compact) {
      return (
        <Box
          ref={ref}
          bg="bg.surface"
          borderLeft="4px solid"
          borderColor={`${statusColor}.500`}
          px={3}
          py={2}
          cursor={onClick ? "pointer" : "default"}
          onClick={onClick}
          _hover={onClick ? { bg: "bg.subtle" } : undefined}
          {...props}
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontWeight="medium" fontSize="sm">
                {learnerName}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {startTime} - {endTime}
              </Text>
            </Box>
            {paymentStatus === "pending" && (
              <Badge colorScheme={paymentColor} size="sm">
                £{price}
              </Badge>
            )}
          </Flex>
        </Box>
      );
    }

    return (
      <Box
        ref={ref}
        bg="bg.surface"
        borderRadius="lg"
        border="1px solid"
        borderColor="border.default"
        overflow="hidden"
        cursor={onClick ? "pointer" : "default"}
        onClick={onClick}
        _hover={onClick ? { borderColor: "border.focused", shadow: "sm" } : undefined}
        transition="all 0.2s"
        {...props}
      >
        {/* Status bar */}
        <Box h="3px" bg={`${statusColor}.500`} />

        <Box p={4}>
          {/* Header */}
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Flex align="center" gap={2}>
              <Box
                bg="bg.subtle"
                borderRadius="full"
                p={2}
              >
                <User size={16} />
              </Box>
              <Box>
                <Text fontWeight="semibold">{learnerName}</Text>
                <Text fontSize="sm" color="fg.muted" textTransform="capitalize">
                  {type.replace("-", " ")} lesson
                </Text>
              </Box>
            </Flex>
            {onMenuClick && (
              <IconButton
                aria-label="More options"
                icon={<MoreVertical size={16} />}
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuClick();
                }}
              />
            )}
          </Flex>

          {/* Time */}
          <Flex align="center" gap={2} mb={2}>
            <Clock size={14} color="var(--chakra-colors-fg-muted)" />
            <Text fontSize="sm">
              {startTime} - {endTime}
              <Text as="span" color="fg.muted" ml={1}>
                ({duration} min)
              </Text>
            </Text>
          </Flex>

          {/* Location */}
          {pickupLocation && (
            <Flex align="center" gap={2} mb={3}>
              <MapPin size={14} color="var(--chakra-colors-fg-muted)" />
              <Text fontSize="sm" color="fg.muted" noOfLines={1}>
                {pickupLocation}
              </Text>
            </Flex>
          )}

          {/* Footer */}
          <Flex justify="space-between" align="center" pt={3} borderTop="1px solid" borderColor="border.default">
            <Flex gap={2}>
              <Badge colorScheme={statusColor} textTransform="capitalize">
                {status}
              </Badge>
              <Badge colorScheme={paymentColor} textTransform="capitalize">
                {paymentStatus}
              </Badge>
            </Flex>
            <Text fontWeight="semibold">£{price}</Text>
          </Flex>
        </Box>
      </Box>
    );
  }
);

LessonCard.displayName = "LessonCard";
