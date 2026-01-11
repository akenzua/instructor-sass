"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Skeleton,
  SkeletonText,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useDisclosure,
  useToast,
  Badge,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { LessonCard } from "@acme/ui";
import { useAuth } from "@/lib/auth";
import { useLearner, useLessons, useDeleteLearner } from "@/hooks";
import { AppShell, LessonDrawer } from "@/components";
import type { Lesson } from "@acme/shared";

export default function LearnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const { instructor, isLoading: authLoading } = useAuth();
  const drawer = useDisclosure();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const learnerId = params.id as string;

  const { data: learner, isLoading: learnerLoading } = useLearner(learnerId);
  const { data: lessonsData, isLoading: lessonsLoading } = useLessons({
    learnerId,
    limit: 50,
  });
  const deleteMutation = useDeleteLearner();

  useEffect(() => {
    if (!authLoading && !instructor) {
      router.push("/login");
    }
  }, [authLoading, instructor, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this learner?")) return;

    try {
      await deleteMutation.mutateAsync(learnerId);
      toast({
        title: "Learner deleted",
        status: "success",
        duration: 3000,
      });
      router.push("/learners");
    } catch (error) {
      toast({
        title: "Failed to delete learner",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    drawer.onOpen();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (authLoading || !instructor) {
    return (
      <Box minH="100vh" bg="bg.subtle" p={8}>
        <Skeleton height="400px" />
      </Box>
    );
  }

  const upcomingLessons =
    lessonsData?.items.filter((l) => l.status === "scheduled") || [];
  const pastLessons =
    lessonsData?.items.filter((l) => l.status !== "scheduled") || [];

  return (
    <AppShell>
      <VStack spacing={6} align="stretch">
        {/* Back Button */}
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => router.push("/learners")}
          alignSelf="flex-start"
        >
          Back to Learners
        </Button>

        {learnerLoading ? (
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Skeleton height="32px" width="200px" />
                <SkeletonText noOfLines={3} spacing={2} width="300px" />
              </VStack>
            </CardBody>
          </Card>
        ) : learner ? (
          <>
            {/* Header Card */}
            <Card>
              <CardBody>
                <Grid
                  templateColumns={{ base: "1fr", md: "2fr 1fr" }}
                  gap={6}
                >
                  <GridItem>
                    <VStack align="start" spacing={4}>
                      <HStack spacing={4}>
                        <Heading size="lg">{learner.firstName} {learner.lastName}</Heading>
                        <Badge
                          colorScheme={
                            learner.status === "active"
                              ? "green"
                              : learner.status === "inactive"
                              ? "gray"
                              : "red"
                          }
                          fontSize="sm"
                        >
                          {learner.status}
                        </Badge>
                      </HStack>

                      <VStack align="start" spacing={2}>
                        <HStack color="text.muted">
                          <Mail size={16} />
                          <Text>{learner.email}</Text>
                        </HStack>
                        {learner.phone && (
                          <HStack color="text.muted">
                            <Phone size={16} />
                            <Text>{learner.phone}</Text>
                          </HStack>
                        )}
                        <HStack color="text.muted">
                          <Calendar size={16} />
                          <Text>
                            Member since{" "}
                            {format(new Date(learner.createdAt), "MMMM yyyy")}
                          </Text>
                        </HStack>
                      </VStack>

                      {learner.notes && (
                        <Box>
                          <Text fontSize="sm" color="text.muted" mb={1}>
                            Notes
                          </Text>
                          <Text>{learner.notes}</Text>
                        </Box>
                      )}
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <VStack align="stretch" spacing={4}>
                      <Box
                        p={4}
                        bg={
                          learner.balance < 0
                            ? "red.50"
                            : learner.balance > 0
                            ? "green.50"
                            : "gray.50"
                        }
                        borderRadius="lg"
                        _dark={{
                          bg:
                            learner.balance < 0
                              ? "red.900"
                              : learner.balance > 0
                              ? "green.900"
                              : "gray.700",
                        }}
                      >
                        <Text fontSize="sm" color="text.muted">
                          Current Balance
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color={
                            learner.balance < 0
                              ? "red.500"
                              : learner.balance > 0
                              ? "green.500"
                              : "text.default"
                          }
                        >
                          {formatCurrency(learner.balance)}
                        </Text>
                        <Text fontSize="xs" color="text.muted">
                          {learner.balance < 0
                            ? "Amount owed"
                            : learner.balance > 0
                            ? "Credit available"
                            : "No balance"}
                        </Text>
                      </Box>

                      <HStack spacing={2}>
                        <Button
                          flex={1}
                          leftIcon={<Edit size={16} />}
                          variant="outline"
                        >
                          Edit
                        </Button>
                        <IconButton
                          aria-label="Delete learner"
                          icon={<Trash2 size={16} />}
                          variant="outline"
                          colorScheme="red"
                          onClick={handleDelete}
                          isLoading={deleteMutation.isPending}
                        />
                      </HStack>
                    </VStack>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Lessons Tabs */}
            <Card>
              <CardBody p={0}>
                <Tabs>
                  <TabList px={4}>
                    <Tab>
                      Upcoming ({upcomingLessons.length})
                    </Tab>
                    <Tab>
                      History ({pastLessons.length})
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      {lessonsLoading ? (
                        <VStack spacing={3}>
                          <Skeleton height="80px" width="100%" />
                          <Skeleton height="80px" width="100%" />
                        </VStack>
                      ) : upcomingLessons.length > 0 ? (
                        <VStack spacing={3} align="stretch">
                          {upcomingLessons.map((lesson) => (
                            <LessonCard
                              key={lesson._id}
                              learnerName={lesson.learner ? `${lesson.learner.firstName || ''} ${lesson.learner.lastName || ''}`.trim() : `${learner.firstName} ${learner.lastName}`}
                              type={lesson.type}
                              startTime={format(new Date(lesson.startTime), "h:mm a")}
                              endTime={format(new Date(lesson.endTime), "h:mm a")}
                              duration={lesson.duration}
                              status={lesson.status}
                              paymentStatus={lesson.paymentStatus}
                              price={lesson.price}
                              pickupLocation={lesson.pickupLocation}
                              onClick={() => handleLessonClick(lesson)}
                            />
                          ))}
                        </VStack>
                      ) : (
                        <Box py={8} textAlign="center">
                          <Text color="text.muted">
                            No upcoming lessons scheduled
                          </Text>
                          <Button mt={4} colorScheme="primary" size="sm">
                            Schedule Lesson
                          </Button>
                        </Box>
                      )}
                    </TabPanel>

                    <TabPanel>
                      {lessonsLoading ? (
                        <VStack spacing={3}>
                          <Skeleton height="80px" width="100%" />
                          <Skeleton height="80px" width="100%" />
                        </VStack>
                      ) : pastLessons.length > 0 ? (
                        <VStack spacing={3} align="stretch">
                          {pastLessons.map((lesson) => (
                            <LessonCard
                              key={lesson._id}
                              learnerName={lesson.learner ? `${lesson.learner.firstName || ''} ${lesson.learner.lastName || ''}`.trim() : `${learner.firstName} ${learner.lastName}`}
                              type={lesson.type}
                              startTime={format(new Date(lesson.startTime), "h:mm a")}
                              endTime={format(new Date(lesson.endTime), "h:mm a")}
                              duration={lesson.duration}
                              status={lesson.status}
                              paymentStatus={lesson.paymentStatus}
                              price={lesson.price}
                              pickupLocation={lesson.pickupLocation}
                              onClick={() => handleLessonClick(lesson)}
                            />
                          ))}
                        </VStack>
                      ) : (
                        <Box py={8} textAlign="center">
                          <Text color="text.muted">No lesson history yet</Text>
                        </Box>
                      )}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </>
        ) : (
          <Card>
            <CardBody>
              <Text>Learner not found</Text>
            </CardBody>
          </Card>
        )}
      </VStack>

      <LessonDrawer
        lesson={selectedLesson}
        isOpen={drawer.isOpen}
        onClose={() => {
          drawer.onClose();
          setSelectedLesson(null);
        }}
      />
    </AppShell>
  );
}
