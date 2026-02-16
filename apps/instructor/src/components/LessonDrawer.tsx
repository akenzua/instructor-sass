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
} from "@chakra-ui/react";
import { Calendar, Clock, MapPin, User, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";
import { useRef, useState } from "react";
import type { Lesson } from "@acme/shared";
import { useCancelLesson, useCompleteLesson } from "@/hooks";
import { StatusBadge } from "@acme/ui";

interface LessonDrawerProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LessonDrawer({ lesson, isOpen, onClose }: LessonDrawerProps) {
  const toast = useToast();
  const cancelDialog = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [cancelReason, setCancelReason] = useState("");

  const cancelMutation = useCancelLesson();
  const completeMutation = useCompleteLesson();

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

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(lesson._id);
      toast({
        title: "Lesson marked as complete",
        status: "success",
        duration: 3000,
      });
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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
                  <DollarSign size={16} />
                  <Text fontSize="sm" fontWeight="medium">
                    Price
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="semibold">
                  {formatCurrency(lesson.price)}
                </Text>
              </Box>

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
    </>
  );
}
