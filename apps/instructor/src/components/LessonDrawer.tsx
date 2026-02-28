"use client";

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Divider,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  Radio,
  RadioGroup,
  Stack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from "@chakra-ui/react";
import { Calendar, Clock, MapPin, User, PoundSterling, FileText, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { useRef, useState, useMemo } from "react";
import type { Lesson } from "@acme/shared";
import { useCancelLesson, useCompleteLesson, useLearnerProgress, useScoreTopic } from "@/hooks";
import { StatusBadge } from "@acme/ui";

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Introduced", color: "red" },
  2: { label: "Developing", color: "orange" },
  3: { label: "Consolidating", color: "yellow" },
  4: { label: "Competent", color: "blue" },
  5: { label: "Independent", color: "green" },
};

interface LessonDrawerProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LessonDrawer({ lesson, isOpen, onClose }: LessonDrawerProps) {
  const toast = useToast();
  const cancelDialog = useDisclosure();
  const completeDialog = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const completeRef = useRef<HTMLButtonElement>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Scoring state
  const [selectedTopicOrder, setSelectedTopicOrder] = useState<number | null>(null);
  const [topicScore, setTopicScore] = useState<string>("");
  const [topicNotes, setTopicNotes] = useState("");

  const cancelMutation = useCancelLesson();
  const completeMutation = useCompleteLesson();
  const scoreMutation = useScoreTopic();

  // Get learner progress for topic selection
  const learnerId = lesson?.learnerId || (lesson?.learner as any)?._id || "";
  const { data: progressData } = useLearnerProgress(learnerId);

  // Build topic options from syllabus
  const topicOptions = useMemo(() => {
    if (!progressData?.syllabus?.topics) return [];
    return progressData.syllabus.topics
      .sort((a, b) => a.order - b.order)
      .map((topic) => {
        const tp = progressData.progress?.topicProgress?.find(
          (p) => p.topicOrder === topic.order,
        );
        return {
          order: topic.order,
          title: topic.title,
          category: topic.category,
          status: tp?.status || "not-started",
          currentScore: tp?.currentScore || 0,
        };
      });
  }, [progressData]);

  // Group topics by category for the dropdown/accordion
  const categorizedTopics = useMemo(() => {
    const groups: Record<string, typeof topicOptions> = {};
    for (const topic of topicOptions) {
      if (!groups[topic.category]) groups[topic.category] = [];
      groups[topic.category].push(topic);
    }
    return Object.entries(groups);
  }, [topicOptions]);

  if (!lesson) return null;

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({
        id: lesson._id,
        reason: cancelReason || undefined,
      });
      toast({
        title: "Lesson cancelled",
        status: "success",
        duration: 3000,
      });
      setCancelReason("");
      cancelDialog.onClose();
      onClose();
    } catch (error) {
      toast({
        title: "Failed to cancel lesson",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleCompleteWithScore = async () => {
    try {
      // First score the topic if one is selected
      if (selectedTopicOrder && topicScore && learnerId) {
        await scoreMutation.mutateAsync({
          lessonId: lesson._id,
          learnerId,
          topicOrder: selectedTopicOrder,
          score: parseInt(topicScore),
          notes: topicNotes || undefined,
        });
      }

      // Then mark lesson as complete
      await completeMutation.mutateAsync(lesson._id);
      toast({
        title: "Lesson completed",
        description: selectedTopicOrder
          ? `Scored topic #${selectedTopicOrder}: ${topicScore}/5`
          : "Lesson marked as complete",
        status: "success",
        duration: 3000,
      });

      // Reset state
      setSelectedTopicOrder(null);
      setTopicScore("");
      setTopicNotes("");
      completeDialog.onClose();
      onClose();
    } catch (error) {
      toast({
        title: "Failed to complete lesson",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleComplete = () => {
    // Always show the complete dialog with scoring option
    // Progress will be auto-initialised by the API if needed
    completeDialog.onOpen();
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "green";
      case "pending":
        return "yellow";
      case "refunded":
        return "gray";
      default:
        return "gray";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <VStack align="start" spacing={2}>
              <Text>Lesson Details</Text>
              <HStack spacing={2}>
                <StatusBadge status={lesson.status} size="md" />
                <Badge colorScheme={getPaymentStatusColor(lesson.paymentStatus)}>
                  {lesson.paymentStatus}
                </Badge>
              </HStack>
            </VStack>
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={6} align="stretch">
              {/* Learner Info */}
              <Box>
                <HStack spacing={2} color="text.muted" mb={2}>
                  <User size={16} />
                  <Text fontSize="sm" fontWeight="medium">
                    Learner
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="semibold">
                  {lesson.learner ? `${lesson.learner.firstName} ${lesson.learner.lastName}` : "Unknown Learner"}
                </Text>
              </Box>

              <Divider />

              {/* Date & Time */}
              <Box>
                <HStack spacing={2} color="text.muted" mb={2}>
                  <Calendar size={16} />
                  <Text fontSize="sm" fontWeight="medium">
                    Date & Time
                  </Text>
                </HStack>
                <Text fontSize="md">
                  {format(new Date(lesson.startTime), "EEEE, MMMM d, yyyy")}
                </Text>
                <Text color="text.muted">
                  {format(new Date(lesson.startTime), "h:mm a")} -{" "}
                  {format(new Date(lesson.endTime), "h:mm a")}
                </Text>
              </Box>

              <Divider />

              {/* Lesson Type */}
              <Box>
                <HStack spacing={2} color="text.muted" mb={2}>
                  <Clock size={16} />
                  <Text fontSize="sm" fontWeight="medium">
                    Lesson Type
                  </Text>
                </HStack>
                <Badge colorScheme="blue" fontSize="sm">
                  {lesson.type.replace("_", " ")}
                </Badge>
              </Box>

              {/* Location */}
              {lesson.pickupLocation && (
                <>
                  <Divider />
                  <Box>
                    <HStack spacing={2} color="text.muted" mb={2}>
                      <MapPin size={16} />
                      <Text fontSize="sm" fontWeight="medium">
                        Location
                      </Text>
                    </HStack>
                    <Text>{lesson.pickupLocation}</Text>
                  </Box>
                </>
              )}

              {/* Price */}
              <Divider />
              <Box>
                <HStack spacing={2} color="text.muted" mb={2}>
                  <PoundSterling size={16} />
                  <Text fontSize="sm" fontWeight="medium">
                    Price
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="semibold">
                  {formatCurrency(lesson.price)}
                </Text>
              </Box>

              {/* Topic Covered (if already scored) */}
              {(lesson as any).topicTitle && (
                <>
                  <Divider />
                  <Box>
                    <HStack spacing={2} color="text.muted" mb={2}>
                      <BookOpen size={16} />
                      <Text fontSize="sm" fontWeight="medium">
                        Topic Covered
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Badge colorScheme="purple" fontSize="sm">
                        #{(lesson as any).topicOrder}
                      </Badge>
                      <Text fontSize="md">{(lesson as any).topicTitle}</Text>
                    </HStack>
                    {(lesson as any).topicScore > 0 && (
                      <HStack spacing={2} mt={1}>
                        <Text fontSize="sm" color="text.muted">
                          Score:
                        </Text>
                        <Badge
                          colorScheme={
                            SCORE_LABELS[(lesson as any).topicScore]?.color || "gray"
                          }
                          variant="solid"
                          fontSize="sm"
                        >
                          {(lesson as any).topicScore} –{" "}
                          {SCORE_LABELS[(lesson as any).topicScore]?.label}
                        </Badge>
                      </HStack>
                    )}
                    {(lesson as any).topicNotes && (
                      <Text fontSize="sm" color="text.muted" mt={1}>
                        {(lesson as any).topicNotes}
                      </Text>
                    )}
                  </Box>
                </>
              )}

              {/* Notes */}
              {lesson.notes && (
                <>
                  <Divider />
                  <Box>
                    <HStack spacing={2} color="text.muted" mb={2}>
                      <FileText size={16} />
                      <Text fontSize="sm" fontWeight="medium">
                        Notes
                      </Text>
                    </HStack>
                    <Text color="text.muted">{lesson.notes}</Text>
                  </Box>
                </>
              )}
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTop="1px solid" borderColor="border.subtle">
            <HStack spacing={3} w="full">
              {lesson.status === "scheduled" && (
                <>
                  <Button
                    variant="outline"
                    colorScheme="red"
                    onClick={cancelDialog.onOpen}
                    isLoading={cancelMutation.isPending}
                    flex={1}
                  >
                    Cancel Lesson
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={handleComplete}
                    isLoading={completeMutation.isPending}
                    flex={1}
                  >
                    Mark Complete
                  </Button>
                </>
              )}
              {lesson.status !== "scheduled" && (
                <Button variant="outline" onClick={onClose} flex={1}>
                  Close
                </Button>
              )}
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        isOpen={cancelDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={cancelDialog.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel Lesson
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack spacing={4} align="stretch">
                <Text>
                  Are you sure you want to cancel this lesson with{" "}
                  <strong>{lesson.learner ? `${lesson.learner.firstName} ${lesson.learner.lastName}` : "this learner"}</strong>? This action cannot be
                  undone.
                </Text>
                <FormControl>
                  <FormLabel fontSize="sm">Reason for cancellation (optional)</FormLabel>
                  <Textarea
                    placeholder="e.g. Learner requested reschedule, weather conditions..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    size="sm"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={cancelDialog.onClose}>
                Keep Lesson
              </Button>
              <Button
                colorScheme="red"
                onClick={handleCancel}
                ml={3}
                isLoading={cancelMutation.isPending}
              >
                Cancel Lesson
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Complete & Score Dialog */}
      <AlertDialog
        isOpen={completeDialog.isOpen}
        leastDestructiveRef={completeRef}
        onClose={() => {
          completeDialog.onClose();
          setSelectedTopicOrder(null);
          setTopicScore("");
          setTopicNotes("");
        }}
        size="lg"
      >
        <AlertDialogOverlay>
          <AlertDialogContent maxW="600px">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              <HStack spacing={2}>
                <BookOpen size={20} />
                <Text>Complete Lesson & Score Topic</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack spacing={5} align="stretch">
                <Text fontSize="sm" color="text.muted">
                  Select the topic covered in this lesson and score the learner.
                  This is optional — you can complete the lesson without scoring.
                </Text>

                {/* Topic Selection */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Topic Covered
                  </FormLabel>
                  {categorizedTopics.length > 0 ? (
                    <Select
                      placeholder="Select a topic (optional)"
                      value={selectedTopicOrder?.toString() || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedTopicOrder(val ? parseInt(val) : null);
                        if (!val) {
                          setTopicScore("");
                          setTopicNotes("");
                        }
                      }}
                      size="sm"
                    >
                      {categorizedTopics.map(([category, topics]) => (
                        <optgroup key={category} label={category}>
                          {topics.map((topic) => (
                            <option key={topic.order} value={topic.order}>
                              #{topic.order} {topic.title}
                              {topic.status === "completed"
                                ? " ✓"
                                : topic.currentScore > 0
                                ? ` (${topic.currentScore}/5)`
                                : ""}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </Select>
                  ) : (
                    <Text fontSize="sm" color="text.muted" fontStyle="italic">
                      Loading syllabus topics…
                    </Text>
                  )}
                </FormControl>

                {/* Score Selection */}
                {selectedTopicOrder && (
                  <>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">
                        Score
                      </FormLabel>
                      <RadioGroup
                        value={topicScore}
                        onChange={setTopicScore}
                      >
                        <Stack spacing={2}>
                          {Object.entries(SCORE_LABELS).map(
                            ([score, { label, color }]) => (
                              <Radio key={score} value={score} colorScheme={color}>
                                <HStack spacing={2}>
                                  <Badge
                                    colorScheme={color}
                                    variant="solid"
                                    fontSize="xs"
                                    minW="20px"
                                    textAlign="center"
                                  >
                                    {score}
                                  </Badge>
                                  <Text fontSize="sm">{label}</Text>
                                </HStack>
                              </Radio>
                            ),
                          )}
                        </Stack>
                      </RadioGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">
                        Notes (optional)
                      </FormLabel>
                      <Textarea
                        placeholder="How did the learner perform? Any areas to focus on next time..."
                        value={topicNotes}
                        onChange={(e) => setTopicNotes(e.target.value)}
                        size="sm"
                        rows={3}
                      />
                    </FormControl>
                  </>
                )}
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={completeRef}
                onClick={() => {
                  completeDialog.onClose();
                  setSelectedTopicOrder(null);
                  setTopicScore("");
                  setTopicNotes("");
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleCompleteWithScore}
                ml={3}
                isLoading={completeMutation.isPending || scoreMutation.isPending}
                isDisabled={selectedTopicOrder != null && !topicScore}
              >
                {selectedTopicOrder ? "Complete & Score" : "Complete Lesson"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
