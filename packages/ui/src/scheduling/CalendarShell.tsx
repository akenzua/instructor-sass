"use client";

import {
  Box,
  Flex,
  IconButton,
  Heading,
  ButtonGroup,
  Button,
  type BoxProps,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarView = "day" | "week" | "month";

export interface CalendarShellProps extends Omit<BoxProps, "title" | "children"> {
  /** Current title (e.g., "January 2024", "Week 1") */
  title: string;
  /** Current view mode */
  view?: CalendarView;
  /** Available view options */
  viewOptions?: CalendarView[];
  /** Callback when navigating back */
  onPrevious?: () => void;
  /** Callback when navigating forward */
  onNext?: () => void;
  /** Callback when going to today */
  onToday?: () => void;
  /** Callback when view changes */
  onViewChange?: (view: CalendarView) => void;
  /** Toolbar actions (e.g., add event button) */
  actions?: React.ReactNode;
  /** Calendar content */
  children: React.ReactNode;
}

const viewLabels: Record<CalendarView, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
};

/**
 * CalendarShell provides a container with toolbar for calendar views.
 */
export function CalendarShell({
  title,
  view = "week",
  viewOptions = ["day", "week", "month"],
  onPrevious,
  onNext,
  onToday,
  onViewChange,
  actions,
  children,
  ...props
}: CalendarShellProps) {
  return (
    <Box {...props}>
      {/* Toolbar */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        gap={4}
        mb={4}
        pb={4}
        borderBottom="1px solid"
        borderColor="border.default"
      >
        <Flex align="center" gap={2}>
          <ButtonGroup size="sm" isAttached variant="outline">
            <IconButton
              aria-label="Previous"
              icon={<ChevronLeft size={18} />}
              onClick={onPrevious}
            />
            <IconButton
              aria-label="Next"
              icon={<ChevronRight size={18} />}
              onClick={onNext}
            />
          </ButtonGroup>
          {onToday && (
            <Button size="sm" variant="ghost" onClick={onToday}>
              Today
            </Button>
          )}
          <Heading size="md" ml={2}>
            {title}
          </Heading>
        </Flex>

        <Flex gap={3} align="center">
          {viewOptions.length > 1 && (
            <ButtonGroup size="sm" isAttached variant="outline">
              {viewOptions.map((v) => (
                <Button
                  key={v}
                  onClick={() => onViewChange?.(v)}
                  bg={view === v ? "bg.subtle" : undefined}
                  fontWeight={view === v ? "semibold" : "normal"}
                >
                  {viewLabels[v]}
                </Button>
              ))}
            </ButtonGroup>
          )}
          {actions}
        </Flex>
      </Flex>

      {/* Calendar content */}
      <Box>{children}</Box>
    </Box>
  );
}

CalendarShell.displayName = "CalendarShell";
