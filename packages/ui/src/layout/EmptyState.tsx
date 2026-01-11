"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  type BoxProps,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps extends BoxProps {
  /** Lucide icon to display */
  icon?: LucideIcon;
  /** Title text */
  title: string;
  /** Description or body text */
  description?: string;
  /** Action button or element */
  action?: React.ReactNode;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: {
    iconSize: 32,
    titleSize: "sm" as const,
    descriptionSize: "xs" as const,
    py: 6,
    gap: 2,
  },
  md: {
    iconSize: 48,
    titleSize: "md" as const,
    descriptionSize: "sm" as const,
    py: 10,
    gap: 3,
  },
  lg: {
    iconSize: 64,
    titleSize: "lg" as const,
    descriptionSize: "md" as const,
    py: 16,
    gap: 4,
  },
};

/**
 * EmptyState displays a placeholder when there is no content to show.
 * Use this for empty lists, search results with no matches, etc.
 */
export function EmptyState({
  icon: IconComponent,
  title,
  description,
  action,
  size = "md",
  ...props
}: EmptyStateProps) {
  const styles = sizeStyles[size];

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      py={styles.py}
      px={6}
      {...props}
    >
      {IconComponent && (
        <Box color="fg.muted" mb={styles.gap}>
          <IconComponent size={styles.iconSize} strokeWidth={1.5} />
        </Box>
      )}
      <Heading
        size={styles.titleSize}
        color="fg.default"
        fontWeight="semibold"
        mb={1}
      >
        {title}
      </Heading>
      {description && (
        <Text
          fontSize={styles.descriptionSize}
          color="fg.muted"
          maxW="sm"
          mb={action ? styles.gap : 0}
        >
          {description}
        </Text>
      )}
      {action && <Box mt={2}>{action}</Box>}
    </Flex>
  );
}

EmptyState.displayName = "EmptyState";
