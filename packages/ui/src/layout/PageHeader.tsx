"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  type BoxProps,
} from "@chakra-ui/react";

export interface PageHeaderProps extends Omit<BoxProps, "title"> {
  /** Page title */
  title: React.ReactNode;
  /** Optional description or subtitle */
  description?: React.ReactNode;
  /** Actions to display on the right side (buttons, etc.) */
  actions?: React.ReactNode;
  /** Breadcrumbs or back navigation */
  breadcrumbs?: React.ReactNode;
}

/**
 * PageHeader provides a consistent header for pages with title, description, and actions.
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  ...props
}: PageHeaderProps) {
  return (
    <Box
      py={6}
      px={{ base: 4, md: 6 }}
      borderBottom="1px solid"
      borderColor="border.default"
      bg="bg.surface"
      {...props}
    >
      {breadcrumbs && <Box mb={3}>{breadcrumbs}</Box>}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        gap={4}
      >
        <Box>
          <Heading as="h1" size="lg" color="fg.default" lineHeight="short">
            {title}
          </Heading>
          {description && (
            <Text mt={1} color="fg.muted" fontSize="md">
              {description}
            </Text>
          )}
        </Box>
        {actions && (
          <Flex
            gap={3}
            flexShrink={0}
            direction={{ base: "column", sm: "row" }}
          >
            {actions}
          </Flex>
        )}
      </Flex>
    </Box>
  );
}

PageHeader.displayName = "PageHeader";
