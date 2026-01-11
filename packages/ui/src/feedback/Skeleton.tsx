"use client";

import {
  Skeleton as ChakraSkeleton,
  SkeletonText,
  SkeletonCircle,
  Stack,
  Flex,
  Box,
  type SkeletonProps as ChakraSkeletonProps,
} from "@chakra-ui/react";

export interface SkeletonProps extends ChakraSkeletonProps {}

/**
 * Basic skeleton placeholder.
 */
export function Skeleton(props: SkeletonProps) {
  return <ChakraSkeleton {...props} />;
}

export interface SkeletonCardProps {
  /** Whether to show an image placeholder */
  hasImage?: boolean;
  /** Number of text lines to show */
  lines?: number;
}

/**
 * Skeleton placeholder for card content.
 */
export function SkeletonCard({ hasImage = false, lines = 3 }: SkeletonCardProps) {
  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" borderColor="border.default">
      {hasImage && <Skeleton height="200px" mb={4} borderRadius="md" />}
      <SkeletonText mt={hasImage ? 0 : 4} noOfLines={lines} spacing={3} skeletonHeight={3} />
    </Box>
  );
}

export interface SkeletonListItemProps {
  /** Whether to show an avatar */
  hasAvatar?: boolean;
}

/**
 * Skeleton placeholder for list items.
 */
export function SkeletonListItem({ hasAvatar = true }: SkeletonListItemProps) {
  return (
    <Flex align="center" py={3} gap={3}>
      {hasAvatar && <SkeletonCircle size="10" />}
      <Box flex={1}>
        <Skeleton height="14px" width="40%" mb={2} />
        <Skeleton height="12px" width="70%" />
      </Box>
    </Flex>
  );
}

export interface SkeletonTableProps {
  /** Number of rows to show */
  rows?: number;
  /** Number of columns to show */
  columns?: number;
}

/**
 * Skeleton placeholder for tables.
 */
export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <Box>
      {/* Header */}
      <Flex gap={4} p={3} bg="bg.subtle" borderRadius="md" mb={2}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} height="14px" flex={1} />
        ))}
      </Flex>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Flex
          key={`row-${rowIndex}`}
          gap={4}
          p={3}
          borderBottom="1px solid"
          borderColor="border.default"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              height="14px"
              flex={1}
            />
          ))}
        </Flex>
      ))}
    </Box>
  );
}

export interface SkeletonMetricProps {
  /** Number of metric cards to show */
  count?: number;
}

/**
 * Skeleton placeholder for metric cards.
 */
export function SkeletonMetric({ count = 4 }: SkeletonMetricProps) {
  return (
    <Stack direction={{ base: "column", md: "row" }} spacing={4}>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          borderColor="border.default"
          flex={1}
        >
          <Skeleton height="12px" width="60%" mb={3} />
          <Skeleton height="32px" width="40%" mb={2} />
          <Skeleton height="10px" width="30%" />
        </Box>
      ))}
    </Stack>
  );
}

Skeleton.displayName = "Skeleton";
SkeletonCard.displayName = "SkeletonCard";
SkeletonListItem.displayName = "SkeletonListItem";
SkeletonTable.displayName = "SkeletonTable";
SkeletonMetric.displayName = "SkeletonMetric";
