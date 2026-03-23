"use client";

import {
  Badge,
  Card,
  CardBody,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";

const READINESS_CONFIG = {
  "not-ready": {
    label: "Not Ready",
    colorScheme: "red",
    emoji: "🔴",
    description: "Your instructor feels you need more practice before taking your test.",
  },
  "nearly-ready": {
    label: "Nearly Ready",
    colorScheme: "orange",
    emoji: "🟡",
    description: "You're getting close! A few more sessions and you'll be ready.",
  },
  "test-ready": {
    label: "Test Ready",
    colorScheme: "green",
    emoji: "🟢",
    description: "Your instructor thinks you're ready to take your driving test!",
  },
} as const;

interface TestReadinessCardProps {
  testReadiness: string | null;
  testReadinessComment: string | null;
  testReadinessUpdatedAt: string | null;
  isLoading: boolean;
}

export function TestReadinessCard({
  testReadiness,
  testReadinessComment,
  testReadinessUpdatedAt,
  isLoading,
}: TestReadinessCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <Skeleton height="80px" />
        </CardBody>
      </Card>
    );
  }

  if (!testReadiness) return null;

  const config = READINESS_CONFIG[testReadiness as keyof typeof READINESS_CONFIG];
  if (!config) return null;

  return (
    <Card>
      <CardBody>
        <Heading size="sm" mb={3}>
          Test Readiness
        </Heading>
        <VStack spacing={3} align="stretch">
          <HStack>
            <Text fontSize="lg">{config.emoji}</Text>
            <Badge
              colorScheme={config.colorScheme}
              fontSize="md"
              px={3}
              py={1}
              borderRadius="md"
            >
              {config.label}
            </Badge>
          </HStack>

          <Text fontSize="sm" color="text.muted">
            {config.description}
          </Text>

          {testReadinessComment && (
            <Text
              fontSize="sm"
              bg="gray.50"
              _dark={{ bg: "gray.700" }}
              p={3}
              borderRadius="md"
              fontStyle="italic"
            >
              &ldquo;{testReadinessComment}&rdquo;
            </Text>
          )}

          {testReadinessUpdatedAt && (
            <Text fontSize="xs" color="text.muted">
              Updated {format(new Date(testReadinessUpdatedAt), "dd MMM yyyy")}
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
