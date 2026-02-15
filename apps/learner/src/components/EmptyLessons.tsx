"use client";

import { Box, Heading, Text } from "@chakra-ui/react";
import { Calendar } from "lucide-react";

export function EmptyLessons() {
  return (
    <Box py={8} textAlign="center">
      <Box display="flex" justifyContent="center" mb={4}>
        <Calendar
          size={48}
          color="var(--chakra-colors-gray-300)"
          aria-hidden="true"
        />
      </Box>
      <Heading size="sm" mb={2}>
        No upcoming lessons
      </Heading>
      <Text color="text.muted" fontSize="sm">
        Contact your instructor to book a lesson
      </Text>
    </Box>
  );
}
