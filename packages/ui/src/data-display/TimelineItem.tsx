"use client";

import {
  Box,
  Flex,
  Circle,
  Text,
  type BoxProps,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

export interface TimelineItemProps extends BoxProps {
  /** Icon to display in the timeline marker */
  icon?: LucideIcon;
  /** Title/heading of the timeline item */
  title: string;
  /** Timestamp or date */
  timestamp?: string;
  /** Description or content */
  description?: React.ReactNode;
  /** Color/tone of the marker */
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
  /** Whether this is the last item (hides the connecting line) */
  isLast?: boolean;
}

const toneColors: Record<string, { bg: string; color: string }> = {
  primary: { bg: "accent.subtle", color: "accent.default" },
  success: { bg: "success.subtle", color: "success.default" },
  warning: { bg: "warning.subtle", color: "warning.default" },
  danger: { bg: "danger.subtle", color: "danger.default" },
  neutral: { bg: "bg.subtle", color: "fg.muted" },
};

/**
 * TimelineItem displays a single item in a timeline list.
 * Use for lesson history, activity logs, etc.
 */
export function TimelineItem({
  icon: IconComponent,
  title,
  timestamp,
  description,
  tone = "neutral",
  isLast = false,
  ...props
}: TimelineItemProps) {
  const colors = toneColors[tone] || toneColors.neutral;

  return (
    <Flex {...props}>
      {/* Timeline marker and line */}
      <Flex direction="column" align="center" mr={4}>
        <Circle size="10" bg={colors.bg} color={colors.color}>
          {IconComponent && <IconComponent size={18} />}
        </Circle>
        {!isLast && (
          <Box
            w="2px"
            flex={1}
            bg="border.default"
            mt={2}
            minH="8"
          />
        )}
      </Flex>

      {/* Content */}
      <Box pb={isLast ? 0 : 6} flex={1}>
        <Flex justify="space-between" align="flex-start" mb={1}>
          <Text fontWeight="semibold" color="fg.default">
            {title}
          </Text>
          {timestamp && (
            <Text fontSize="sm" color="fg.muted" flexShrink={0} ml={2}>
              {timestamp}
            </Text>
          )}
        </Flex>
        {description && (
          <Box color="fg.muted" fontSize="sm">
            {typeof description === "string" ? (
              <Text>{description}</Text>
            ) : (
              description
            )}
          </Box>
        )}
      </Box>
    </Flex>
  );
}

TimelineItem.displayName = "TimelineItem";
