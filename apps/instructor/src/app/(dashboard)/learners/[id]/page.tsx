"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Card,
  CardBody,
  CircularProgress,
  CircularProgressLabel,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Select,
  Skeleton,
  SkeletonText,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  Tooltip,
  VStack,
  Wrap,
  WrapItem,
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
  CheckCircle2,
  Circle,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";
import { LessonCard } from "@acme/ui";
import {
  useLearner,
  useLessons,
  useDeleteLearner,
  useUpdateLearner,
  useLearnerProgress,
  useCompleteTopic,
  useReopenTopic,
  useTestReadiness,
  useUpdateTestReadiness,
} from "@/hooks";
import { LessonDrawer } from "@/components";
import type { Lesson } from "@acme/shared";
import type { TopicProgressEntry, SyllabusTopic } from "@/lib/api";

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Introduced", color: "red" },
  2: { label: "Developing", color: "orange" },
  3: { label: "Consolidating", color: "yellow" },
  4: { label: "Competent", color: "blue" },
  5: { label: "Independent", color: "green" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Vehicle Controls & Precautions": "blue",
  "Junctions & Roundabouts": "purple",
  "Road Procedure": "teal",
  "Judgement & Meeting Traffic": "orange",
  "Awareness & Planning": "cyan",
  Manoeuvres: "pink",
  "Emergency & Independent": "red",
  "Additional Road Types & Conditions": "green",
  "Test Preparation": "yellow",
};

export default function LearnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const toast = useToast();
  const drawer = useDisclosure();
  const deleteDialog = useDisclosure();
  const editModal = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    licenseNumber: "",
    testDate: "",
    notes: "",
    status: "active" as "active" | "inactive" | "archived",
    addressLine1: "",
    addressLine2: "",
    addressCity: "",
    addressPostcode: "",
  });

  const learnerId = params.id as string;

  const { data: learner, isLoading: learnerLoading } = useLearner(learnerId);
  const { data: lessonsData, isLoading: lessonsLoading } = useLessons({
    learnerId,
    limit: 50,
  });
  const { data: progressData, isLoading: progressLoading } = useLearnerProgress(learnerId);
  const deleteMutation = useDeleteLearner();
  const updateMutation = useUpdateLearner();
  const completeTopicMutation = useCompleteTopic();
  const reopenTopicMutation = useReopenTopic();
  const { data: testReadinessData } = useTestReadiness(learnerId);
  const updateTestReadinessMutation = useUpdateTestReadiness();
  const [readinessComment, setReadinessComment] = useState("");

  // Sync readiness comment when data loads
  useEffect(() => {
    if (testReadinessData?.testReadinessComment) {
      setReadinessComment(testReadinessData.testReadinessComment);
    }
  }, [testReadinessData?.testReadinessComment]);

  // Auto-open lesson drawer if ?complete=lessonId is in URL (from notification)
  useEffect(() => {
    const completeLessonId = searchParams.get("complete");
    if (completeLessonId && lessonsData?.items && !selectedLesson) {
      const lesson = lessonsData.items.find((l) => l._id === completeLessonId);
      if (lesson) {
        setSelectedLesson(lesson);
        drawer.onOpen();
        // Clean the URL param
        router.replace(`/learners/${learnerId}`, { scroll: false });
      }
    }
  }, [searchParams, lessonsData, selectedLesson, drawer, learnerId, router]);

  // Populate edit form when learner loads or edit modal opens
  useEffect(() => {
    if (learner && editModal.isOpen) {
      setEditForm({
        firstName: learner.firstName || "",
        lastName: learner.lastName || "",
        email: learner.email || "",
        phone: learner.phone || "",
        dateOfBirth: learner.dateOfBirth
          ? learner.dateOfBirth.split("T")[0]
          : "",
        licenseNumber: learner.licenseNumber || "",
        testDate: learner.testDate ? learner.testDate.split("T")[0] : "",
        notes: learner.notes || "",
        status: (learner.status as "active" | "inactive" | "archived") || "active",
        addressLine1: learner.address?.line1 || "",
        addressLine2: learner.address?.line2 || "",
        addressCity: learner.address?.city || "",
        addressPostcode: learner.address?.postcode || "",
      });
    }
  }, [learner, editModal.isOpen]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(learnerId);
      deleteDialog.onClose();
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

  const handleEditSave = async () => {
    try {
      const data: Record<string, unknown> = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        status: editForm.status,
      };

      if (editForm.phone.trim()) data.phone = editForm.phone.trim();
      if (editForm.dateOfBirth) data.dateOfBirth = editForm.dateOfBirth;
      if (editForm.licenseNumber.trim()) data.licenseNumber = editForm.licenseNumber.trim();
      if (editForm.testDate) data.testDate = new Date(editForm.testDate).toISOString();
      if (editForm.notes.trim()) data.notes = editForm.notes.trim();

      const hasAddress =
        editForm.addressLine1.trim() ||
        editForm.addressLine2.trim() ||
        editForm.addressCity.trim() ||
        editForm.addressPostcode.trim();
      if (hasAddress) {
        data.address = {
          line1: editForm.addressLine1.trim(),
          line2: editForm.addressLine2.trim(),
          city: editForm.addressCity.trim(),
          postcode: editForm.addressPostcode.trim(),
        };
      }

      await updateMutation.mutateAsync({ id: learnerId, data: data as any });
      editModal.onClose();
      toast({
        title: "Learner updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to update learner",
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
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const handleCompleteTopic = async (topicOrder: number) => {
    try {
      await completeTopicMutation.mutateAsync({ learnerId, topicOrder });
      toast({ title: "Topic marked as complete", status: "success", duration: 2000 });
    } catch (error) {
      toast({
        title: "Failed to complete topic",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleReopenTopic = async (topicOrder: number) => {
    try {
      await reopenTopicMutation.mutateAsync({ learnerId, topicOrder });
      toast({ title: "Topic reopened", status: "success", duration: 2000 });
    } catch (error) {
      toast({
        title: "Failed to reopen topic",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  // Build progress lookup map
  const progressMap = useMemo(() => {
    if (!progressData?.progress?.topicProgress) return new Map<number, TopicProgressEntry>();
    const map = new Map<number, TopicProgressEntry>();
    for (const tp of progressData.progress.topicProgress) {
      map.set(tp.topicOrder, tp);
    }
    return map;
  }, [progressData]);

  // Group syllabus topics by category with progress
  const categorizedProgress = useMemo(() => {
    if (!progressData?.syllabus?.topics) return [];
    const groups: Record<string, (SyllabusTopic & { progress?: TopicProgressEntry })[]> = {};
    for (const topic of progressData.syllabus.topics) {
      if (!groups[topic.category]) groups[topic.category] = [];
      groups[topic.category].push({
        ...topic,
        progress: progressMap.get(topic.order),
      });
    }
    return Object.entries(groups).map(([category, topics]) => ({
      category,
      topics: topics.sort((a, b) => a.order - b.order),
    }));
  }, [progressData, progressMap]);

  // Overall progress stats
  const progressStats = useMemo(() => {
    if (!progressData?.progress?.topicProgress || !progressData?.syllabus?.topics) {
      return { total: 0, completed: 0, inProgress: 0, notStarted: 0, avgScore: 0 };
    }
    const total = progressData.syllabus.topics.length;
    let completed = 0;
    let inProgress = 0;
    let scoreSum = 0;
    let scoreCount = 0;
    for (const tp of progressData.progress.topicProgress) {
      if (tp.status === "completed") completed++;
      else if (tp.status === "in-progress") inProgress++;
      if (tp.currentScore > 0) {
        scoreSum += tp.currentScore;
        scoreCount++;
      }
    }
    return {
      total,
      completed,
      inProgress,
      notStarted: total - completed - inProgress,
      avgScore: scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : 0,
    };
  }, [progressData]);

  const upcomingLessons =
    lessonsData?.items.filter((l) => l.status === "scheduled") || [];
  const pastLessons =
    lessonsData?.items.filter((l) => l.status !== "scheduled") || [];

  return (
    <>
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

                      {/* Test Readiness */}
                      <Box
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor="border.subtle"
                      >
                        <Text fontSize="sm" fontWeight="semibold" mb={3}>
                          Test Readiness
                        </Text>
                        <VStack spacing={2} align="stretch">
                          {(["not-ready", "nearly-ready", "test-ready"] as const).map((status) => {
                            const isSelected = testReadinessData?.testReadiness === status;
                            const config = {
                              "not-ready": { label: "Not Ready", colorScheme: "red", emoji: "🔴" },
                              "nearly-ready": { label: "Nearly Ready", colorScheme: "orange", emoji: "🟡" },
                              "test-ready": { label: "Test Ready", colorScheme: "green", emoji: "🟢" },
                            }[status];
                            return (
                              <Button
                                key={status}
                                size="sm"
                                variant={isSelected ? "solid" : "outline"}
                                colorScheme={config.colorScheme}
                                justifyContent="flex-start"
                                leftIcon={<Text>{config.emoji}</Text>}
                                isLoading={
                                  updateTestReadinessMutation.isPending &&
                                  !isSelected
                                }
                                onClick={() => {
                                  updateTestReadinessMutation.mutate(
                                    {
                                      learnerId,
                                      testReadiness: status,
                                      comment: readinessComment || undefined,
                                    },
                                    {
                                      onSuccess: () => {
                                        toast({
                                          title: `Readiness set to "${config.label}"`,
                                          status: "success",
                                          duration: 2000,
                                        });
                                      },
                                    }
                                  );
                                }}
                              >
                                {config.label}
                              </Button>
                            );
                          })}
                          <Textarea
                            placeholder="Optional comment..."
                            size="sm"
                            fontSize="sm"
                            rows={2}
                            value={readinessComment}
                            onChange={(e) => setReadinessComment(e.target.value)}
                          />
                          {testReadinessData?.testReadinessUpdatedAt && (
                            <Text fontSize="2xs" color="text.muted">
                              Last updated{" "}
                              {format(
                                new Date(testReadinessData.testReadinessUpdatedAt),
                                "dd MMM yyyy"
                              )}
                            </Text>
                          )}
                        </VStack>
                      </Box>

                      <HStack spacing={2}>
                        <Button
                          flex={1}
                          leftIcon={<Edit size={16} />}
                          variant="outline"
                          onClick={editModal.onOpen}
                        >
                          Edit
                        </Button>
                        <IconButton
                          aria-label="Delete learner"
                          icon={<Trash2 size={16} />}
                          variant="outline"
                          colorScheme="red"
                          onClick={deleteDialog.onOpen}
                        />
                      </HStack>
                    </VStack>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Lessons & Progress Tabs */}
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
                    <Tab>
                      <HStack spacing={1}>
                        <BookOpen size={14} />
                        <Text>Progress</Text>
                        {progressStats.total > 0 && (
                          <Badge colorScheme="primary" fontSize="xs" ml={1}>
                            {progressStats.completed}/{progressStats.total}
                          </Badge>
                        )}
                      </HStack>
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

                    {/* Progress Tab */}
                    <TabPanel>
                      {progressLoading ? (
                        <VStack spacing={3}>
                          <Skeleton height="80px" width="100%" />
                          <Skeleton height="80px" width="100%" />
                          <Skeleton height="80px" width="100%" />
                        </VStack>
                      ) : !progressData ? (
                        <Box py={10} textAlign="center">
                          <VStack spacing={4}>
                            <BookOpen size={48} color="var(--chakra-colors-gray-400)" />
                            <Text color="text.muted" maxW="400px">
                              Loading progress data…
                            </Text>
                          </VStack>
                        </Box>
                      ) : (
                        <VStack spacing={6} align="stretch">
                          {/* Summary Cards */}
                          <Grid
                            templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }}
                            gap={4}
                          >
                            <Box
                              p={4}
                              bg="gray.50"
                              _dark={{ bg: "gray.700" }}
                              borderRadius="lg"
                              textAlign="center"
                            >
                              <CircularProgress
                                value={
                                  progressStats.total > 0
                                    ? (progressStats.completed / progressStats.total) * 100
                                    : 0
                                }
                                size="60px"
                                color="green.400"
                                trackColor="gray.200"
                              >
                                <CircularProgressLabel fontSize="xs" fontWeight="bold">
                                  {progressStats.total > 0
                                    ? Math.round(
                                        (progressStats.completed / progressStats.total) * 100,
                                      )
                                    : 0}
                                  %
                                </CircularProgressLabel>
                              </CircularProgress>
                              <Text fontSize="xs" color="text.muted" mt={1}>
                                Overall
                              </Text>
                            </Box>

                            <Box
                              p={4}
                              bg="green.50"
                              _dark={{ bg: "green.900" }}
                              borderRadius="lg"
                              textAlign="center"
                            >
                              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                                {progressStats.completed}
                              </Text>
                              <Text fontSize="xs" color="text.muted">
                                Completed
                              </Text>
                            </Box>

                            <Box
                              p={4}
                              bg="blue.50"
                              _dark={{ bg: "blue.900" }}
                              borderRadius="lg"
                              textAlign="center"
                            >
                              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                                {progressStats.inProgress}
                              </Text>
                              <Text fontSize="xs" color="text.muted">
                                In Progress
                              </Text>
                            </Box>

                            <Box
                              p={4}
                              bg="orange.50"
                              _dark={{ bg: "orange.900" }}
                              borderRadius="lg"
                              textAlign="center"
                            >
                              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                                {progressStats.avgScore > 0
                                  ? progressStats.avgScore
                                  : "—"}
                              </Text>
                              <Text fontSize="xs" color="text.muted">
                                Avg Score
                              </Text>
                            </Box>
                          </Grid>

                          {/* Score Legend */}
                          <HStack spacing={3} flexWrap="wrap">
                            {Object.entries(SCORE_LABELS).map(([score, { label, color }]) => (
                              <HStack key={score} spacing={1}>
                                <Badge colorScheme={color} variant="solid" fontSize="2xs">
                                  {score}
                                </Badge>
                                <Text fontSize="xs" color="text.muted">
                                  {label}
                                </Text>
                              </HStack>
                            ))}
                          </HStack>

                          {/* Topics by Category */}
                          <Accordion allowMultiple defaultIndex={[0]}>
                            {categorizedProgress.map(({ category, topics }) => {
                              const catCompleted = topics.filter(
                                (t) => t.progress?.status === "completed",
                              ).length;
                              return (
                                <AccordionItem key={category} border="none" mb={2}>
                                  <AccordionButton
                                    bg={`${CATEGORY_COLORS[category] || "gray"}.50`}
                                    _dark={{
                                      bg: `${CATEGORY_COLORS[category] || "gray"}.900`,
                                    }}
                                    borderRadius="lg"
                                    _hover={{
                                      bg: `${CATEGORY_COLORS[category] || "gray"}.100`,
                                    }}
                                  >
                                    <Box flex="1" textAlign="left">
                                      <HStack spacing={2}>
                                        <Text fontWeight="semibold" fontSize="sm">
                                          {category}
                                        </Text>
                                        <Badge
                                          colorScheme={
                                            catCompleted === topics.length
                                              ? "green"
                                              : "gray"
                                          }
                                          fontSize="2xs"
                                        >
                                          {catCompleted}/{topics.length}
                                        </Badge>
                                      </HStack>
                                      <Progress
                                        value={
                                          topics.length > 0
                                            ? (catCompleted / topics.length) * 100
                                            : 0
                                        }
                                        size="xs"
                                        colorScheme={
                                          CATEGORY_COLORS[category] || "gray"
                                        }
                                        mt={1}
                                        borderRadius="full"
                                      />
                                    </Box>
                                    <AccordionIcon />
                                  </AccordionButton>
                                  <AccordionPanel pb={4} px={1}>
                                    <VStack spacing={2} align="stretch">
                                      {topics.map((topic) => {
                                        const tp = topic.progress;
                                        const status = tp?.status || "not-started";
                                        const score = tp?.currentScore || 0;

                                        return (
                                          <Box
                                            key={topic.order}
                                            p={3}
                                            borderWidth="1px"
                                            borderRadius="md"
                                            borderColor={
                                              status === "completed"
                                                ? "green.200"
                                                : status === "in-progress"
                                                ? "blue.200"
                                                : "border.subtle"
                                            }
                                            bg={
                                              status === "completed"
                                                ? "green.50"
                                                : status === "in-progress"
                                                ? "blue.50"
                                                : "transparent"
                                            }
                                            _dark={{
                                              bg:
                                                status === "completed"
                                                  ? "green.900"
                                                  : status === "in-progress"
                                                  ? "blue.900"
                                                  : "transparent",
                                              borderColor:
                                                status === "completed"
                                                  ? "green.700"
                                                  : status === "in-progress"
                                                  ? "blue.700"
                                                  : "border.subtle",
                                            }}
                                          >
                                            <HStack justify="space-between" align="start">
                                              <HStack spacing={2} flex={1}>
                                                <Box mt={0.5}>
                                                  {status === "completed" ? (
                                                    <CheckCircle2
                                                      size={18}
                                                      color="var(--chakra-colors-green-500)"
                                                    />
                                                  ) : (
                                                    <Circle
                                                      size={18}
                                                      color={
                                                        status === "in-progress"
                                                          ? "var(--chakra-colors-blue-400)"
                                                          : "var(--chakra-colors-gray-400)"
                                                      }
                                                    />
                                                  )}
                                                </Box>
                                                <Box flex={1}>
                                                  <HStack spacing={2} mb={0.5}>
                                                    <Badge
                                                      colorScheme={
                                                        CATEGORY_COLORS[topic.category] || "gray"
                                                      }
                                                      variant="subtle"
                                                      fontSize="2xs"
                                                    >
                                                      #{topic.order}
                                                    </Badge>
                                                    <Text
                                                      fontSize="sm"
                                                      fontWeight="semibold"
                                                      textDecoration={
                                                        status === "completed"
                                                          ? "none"
                                                          : "none"
                                                      }
                                                    >
                                                      {topic.title}
                                                    </Text>
                                                  </HStack>
                                                  {topic.description && (
                                                    <Text
                                                      fontSize="xs"
                                                      color="text.muted"
                                                      noOfLines={2}
                                                    >
                                                      {topic.description}
                                                    </Text>
                                                  )}
                                                  {score > 0 && (
                                                    <HStack spacing={1} mt={1}>
                                                      <Text
                                                        fontSize="xs"
                                                        color="text.muted"
                                                      >
                                                        Score:
                                                      </Text>
                                                      <Badge
                                                        colorScheme={
                                                          SCORE_LABELS[score]?.color ||
                                                          "gray"
                                                        }
                                                        variant="solid"
                                                        fontSize="2xs"
                                                      >
                                                        {score} –{" "}
                                                        {SCORE_LABELS[score]?.label}
                                                      </Badge>
                                                      {tp?.attempts && tp.attempts > 0 && (
                                                        <Text
                                                          fontSize="2xs"
                                                          color="text.muted"
                                                        >
                                                          ({tp.attempts} attempt
                                                          {tp.attempts > 1 ? "s" : ""})
                                                        </Text>
                                                      )}
                                                    </HStack>
                                                  )}
                                                  {/* Score history */}
                                                  {tp?.history && tp.history.length > 0 && (
                                                    <Box mt={2}>
                                                      <Text
                                                        fontSize="2xs"
                                                        color="text.muted"
                                                        fontWeight="medium"
                                                        mb={1}
                                                      >
                                                        Score History:
                                                      </Text>
                                                      <Wrap spacing={1}>
                                                        {tp.history
                                                          .slice(-5)
                                                          .map((h, i) => (
                                                            <WrapItem key={i}>
                                                              <Tooltip
                                                                label={`${format(new Date(h.date), "dd MMM yyyy")}${h.notes ? ` – ${h.notes}` : ""}`}
                                                                fontSize="xs"
                                                              >
                                                                <Badge
                                                                  colorScheme={
                                                                    SCORE_LABELS[h.score]
                                                                      ?.color || "gray"
                                                                  }
                                                                  variant="outline"
                                                                  fontSize="2xs"
                                                                  cursor="pointer"
                                                                >
                                                                  {h.score}
                                                                </Badge>
                                                              </Tooltip>
                                                            </WrapItem>
                                                          ))}
                                                      </Wrap>
                                                    </Box>
                                                  )}
                                                </Box>
                                              </HStack>

                                              {/* Action buttons */}
                                              <HStack spacing={1}>
                                                {status === "in-progress" &&
                                                  score >= 4 && (
                                                    <Tooltip label="Mark as complete">
                                                      <IconButton
                                                        aria-label="Complete topic"
                                                        icon={
                                                          <CheckCircle2 size={16} />
                                                        }
                                                        size="xs"
                                                        colorScheme="green"
                                                        variant="ghost"
                                                        onClick={() =>
                                                          handleCompleteTopic(
                                                            topic.order,
                                                          )
                                                        }
                                                        isLoading={
                                                          completeTopicMutation.isPending
                                                        }
                                                      />
                                                    </Tooltip>
                                                  )}
                                                {status === "completed" && (
                                                  <Tooltip label="Reopen topic">
                                                    <IconButton
                                                      aria-label="Reopen topic"
                                                      icon={<RotateCcw size={14} />}
                                                      size="xs"
                                                      colorScheme="orange"
                                                      variant="ghost"
                                                      onClick={() =>
                                                        handleReopenTopic(topic.order)
                                                      }
                                                      isLoading={
                                                        reopenTopicMutation.isPending
                                                      }
                                                    />
                                                  </Tooltip>
                                                )}
                                              </HStack>
                                            </HStack>
                                          </Box>
                                        );
                                      })}
                                    </VStack>
                                  </AccordionPanel>
                                </AccordionItem>
                              );
                            })}
                          </Accordion>
                        </VStack>
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

      {/* Lesson Drawer */}
      <LessonDrawer
        lesson={selectedLesson}
        isOpen={drawer.isOpen}
        onClose={() => {
          drawer.onClose();
          setSelectedLesson(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteDialog.onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Learner
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="semibold">
                {learner?.firstName} {learner?.lastName}
              </Text>
              ? This will permanently remove their profile and cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteDialog.onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Edit Learner Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Learner</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">First Name</FormLabel>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Last Name</FormLabel>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Email</FormLabel>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Phone</FormLabel>
                  <Input
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Status</FormLabel>
                  <Select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as "active" | "inactive" | "archived",
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Date of Birth</FormLabel>
                  <Input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dateOfBirth: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Driving Test Date</FormLabel>
                  <Input
                    type="date"
                    value={editForm.testDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, testDate: e.target.value })
                    }
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel fontSize="sm">Licence Number</FormLabel>
                <Input
                  placeholder="e.g. JONES910250J93CW"
                  value={editForm.licenseNumber}
                  maxLength={16}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      licenseNumber: e.target.value.toUpperCase(),
                    })
                  }
                />
              </FormControl>

              <Text fontSize="sm" fontWeight="medium" w="full" pt={2}>
                Address
              </Text>

              <FormControl>
                <FormLabel fontSize="sm">Address Line 1</FormLabel>
                <Input
                  value={editForm.addressLine1}
                  onChange={(e) =>
                    setEditForm({ ...editForm, addressLine1: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Address Line 2</FormLabel>
                <Input
                  value={editForm.addressLine2}
                  onChange={(e) =>
                    setEditForm({ ...editForm, addressLine2: e.target.value })
                  }
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">City</FormLabel>
                  <Input
                    value={editForm.addressCity}
                    onChange={(e) =>
                      setEditForm({ ...editForm, addressCity: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Postcode</FormLabel>
                  <Input
                    value={editForm.addressPostcode}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        addressPostcode: e.target.value,
                      })
                    }
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel fontSize="sm">Notes</FormLabel>
                <Textarea
                  value={editForm.notes}
                  rows={3}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  placeholder="Any notes about this learner..."
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={editModal.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              onClick={handleEditSave}
              isLoading={updateMutation.isPending}
              isDisabled={
                !editForm.firstName.trim() ||
                !editForm.lastName.trim() ||
                !editForm.email.trim()
              }
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
