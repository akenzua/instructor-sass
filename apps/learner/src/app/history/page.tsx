"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { LessonCard, PageHeader } from "@acme/ui";
import { useLearnerAuth } from "@/lib/auth";
import { lessonsApi } from "@/lib/api";

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useLearnerAuth();

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ["learner", "lessons", "history"],
    queryFn: () => lessonsApi.getMyLessons(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <Box minH="100vh" bg="bg.subtle" p={8}>
        <Skeleton height="400px" />
      </Box>
    );
  }

  const completedLessons = lessons?.filter((l) => l.status === "completed") || [];
  const cancelledLessons = lessons?.filter((l) => l.status === "cancelled") || [];
  const scheduledLessons = lessons?.filter((l) => l.status === "scheduled") || [];

  return (
    <Box minH="100vh" bg="bg.subtle">
      {/* Header */}
      <Box bg="bg.surface" borderBottom="1px solid" borderColor="border.subtle" px={6} py={4}>
        <HStack maxW="container.xl" mx="auto">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => router.push("/")}
          >
            Back
          </Button>
        </HStack>
      </Box>

      {/* Content */}
      <Box maxW="container.xl" mx="auto" p={6}>
        <VStack spacing={6} align="stretch">
          <PageHeader
            title="Lesson History"
            description="View all your past and upcoming lessons"
          />

          {lessonsLoading ? (
            <VStack spacing={4}>
              <Skeleton height="100px" width="100%" borderRadius="lg" />
              <Skeleton height="100px" width="100%" borderRadius="lg" />
              <Skeleton height="100px" width="100%" borderRadius="lg" />
            </VStack>
          ) : lessons && lessons.length > 0 ? (
            <VStack spacing={6} align="stretch">
              {/* Scheduled */}
              {scheduledLessons.length > 0 && (
                <Card>
                  <CardBody>
                    <HStack justify="space-between" mb={4}>
                      <Heading size="sm">Upcoming</Heading>
                      <Badge colorScheme="blue">{scheduledLessons.length}</Badge>
                    </HStack>
                    <VStack spacing={3} align="stretch">
                      {scheduledLessons.map((lesson) => (
                        <LessonCard
                          key={lesson._id}
                          learnerName=""
                          type={lesson.type}
                          startTime={format(new Date(lesson.startTime), "h:mm a")}
                          endTime={format(new Date(lesson.endTime), "h:mm a")}
                          duration={lesson.duration}
                          status={lesson.status}
                          paymentStatus={lesson.paymentStatus}
                          price={lesson.price}
                          pickupLocation={lesson.pickupLocation}
                        />
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Completed */}
              {completedLessons.length > 0 && (
                <Card>
                  <CardBody>
                    <HStack justify="space-between" mb={4}>
                      <Heading size="sm">Completed</Heading>
                      <Badge colorScheme="green">{completedLessons.length}</Badge>
                    </HStack>
                    <VStack spacing={3} align="stretch">
                      {completedLessons.map((lesson) => (
                        <LessonCard
                          key={lesson._id}
                          learnerName=""
                          type={lesson.type}
                          startTime={format(new Date(lesson.startTime), "h:mm a")}
                          endTime={format(new Date(lesson.endTime), "h:mm a")}
                          duration={lesson.duration}
                          status={lesson.status}
                          paymentStatus={lesson.paymentStatus}
                          price={lesson.price}
                          pickupLocation={lesson.pickupLocation}
                        />
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Cancelled */}
              {cancelledLessons.length > 0 && (
                <Card>
                  <CardBody>
                    <HStack justify="space-between" mb={4}>
                      <Heading size="sm">Cancelled</Heading>
                      <Badge colorScheme="red">{cancelledLessons.length}</Badge>
                    </HStack>
                    <VStack spacing={3} align="stretch">
                      {cancelledLessons.map((lesson) => (
                        <LessonCard
                          key={lesson._id}
                          learnerName=""
                          type={lesson.type}
                          startTime={format(new Date(lesson.startTime), "h:mm a")}
                          endTime={format(new Date(lesson.endTime), "h:mm a")}
                          duration={lesson.duration}
                          status={lesson.status}
                          paymentStatus={lesson.paymentStatus}
                          price={lesson.price}
                          pickupLocation={lesson.pickupLocation}
                        />
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          ) : (
            <Card>
              <CardBody>
                <Box py={8} textAlign="center">
                  <Text color="text.muted">No lesson history yet</Text>
                </Box>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
