"use client";

import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  AlertIcon,
  Divider,
  Skeleton,
  Box,
  useToast,
} from "@chakra-ui/react";
import { useCancellationPreview, useCancelLesson } from "@/hooks";
import { formatCurrency } from "@/lib/utils";

interface CancelLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonDate?: string;
}

const tierLabels: Record<string, { label: string; color: string }> = {
  free: { label: "Free cancellation", color: "green" },
  late: { label: "Late cancellation", color: "yellow" },
  "very-late": { label: "Very late cancellation", color: "red" },
};

export function CancelLessonModal({
  isOpen,
  onClose,
  lessonId,
  lessonDate,
}: CancelLessonModalProps) {
  const [reason, setReason] = useState("");
  const toast = useToast();

  const {
    data: preview,
    isLoading: previewLoading,
    error: previewError,
  } = useCancellationPreview(isOpen ? lessonId : null);

  const cancelMutation = useCancelLesson();

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({
        lessonId,
        reason: reason.trim() || undefined,
      });
      toast({
        title: "Lesson cancelled",
        description:
          preview && preview.fee > 0
            ? `A fee of ${formatCurrency(preview.fee)} has been deducted. Your new balance is ${formatCurrency(preview.balanceAfterCancel)}.`
            : "Your lesson has been cancelled with no charge.",
        status: "success",
        duration: 5000,
      });
      setReason("");
      onClose();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Failed to cancel lesson. Please try again.";
      toast({
        title: "Cancellation failed",
        description: message || "Failed to cancel lesson. Please try again.",
        status: "error",
        duration: 5000,
      });
    }
  };

  const tierInfo = preview ? tierLabels[preview.tier] : null;
  const isPaid = preview?.paymentStatus === "paid";
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Cancel Lesson</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {lessonDate && (
              <Text fontSize="sm" color="gray.600">
                Lesson on <strong>{lessonDate}</strong>
              </Text>
            )}

            {previewLoading && (
              <VStack spacing={3}>
                <Skeleton height="20px" />
                <Skeleton height="40px" />
                <Skeleton height="20px" />
              </VStack>
            )}

            {previewError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Unable to load cancellation details. Please try again.
                </Text>
              </Alert>
            )}

            {preview && !preview.allowLearnerCancellation && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Your instructor does not allow online cancellations. Please
                  contact them directly to cancel.
                </Text>
              </Alert>
            )}

            {preview && preview.allowLearnerCancellation && (
              <>
                {/* Fee breakdown */}
                <Box p={4} bg="gray.50" borderRadius="md">
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Cancellation type
                      </Text>
                      {tierInfo && (
                        <Badge colorScheme={tierInfo.color}>
                          {tierInfo.label}
                        </Badge>
                      )}
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Hours until lesson
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {Math.round(preview.hoursUntilLesson)}h
                      </Text>
                    </HStack>

                    <Divider />

                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Lesson price
                      </Text>
                      <Text fontSize="sm">
                        {formatCurrency(preview.lessonPrice)}
                      </Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Cancellation fee ({preview.chargePercent}%)
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={preview.fee > 0 ? "red.500" : "green.500"}
                      >
                        {preview.fee > 0
                          ? `- ${formatCurrency(preview.fee)}`
                          : "No charge"}
                      </Text>
                    </HStack>

                    {isPaid && preview.refundAmount > 0 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Credit kept in account
                        </Text>
                        <Text fontSize="sm" fontWeight="medium" color="green.500">
                          {formatCurrency(preview.refundAmount)}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>

                {/* Balance impact */}
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="xs" fontWeight="semibold" color="blue.700" mb={2}>
                    Account Balance Impact
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Current balance
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {formatCurrency(preview.currentBalance)}
                      </Text>
                    </HStack>
                    {preview.fee > 0 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Fee deducted
                        </Text>
                        <Text fontSize="sm" color="red.500">
                          - {formatCurrency(preview.fee)}
                        </Text>
                      </HStack>
                    )}
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="semibold">
                        Balance after cancellation
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={preview.balanceAfterCancel >= 0 ? "green.600" : "red.600"}
                      >
                        {preview.balanceAfterCancel < 0 && "- "}
                        {formatCurrency(preview.balanceAfterCancel)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                {preview.fee > 0 && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      {isPaid
                        ? `A fee of ${formatCurrency(preview.fee)} (${preview.chargePercent}%) will be deducted from your balance. The remaining ${formatCurrency(preview.refundAmount)} stays as credit for future bookings.`
                        : `A fee of ${formatCurrency(preview.fee)} (${preview.chargePercent}%) will be charged to your account because you are cancelling within ${Math.round(preview.hoursUntilLesson)} hours of your lesson.`}
                    </Text>
                  </Alert>
                )}

                {preview.fee === 0 && isPaid && (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      No cancellation fee applies. The full {formatCurrency(preview.lessonPrice)} stays in your account as credit for future bookings.
                    </Text>
                  </Alert>
                )}

                {preview.balanceAfterCancel < 0 && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      This will result in an outstanding balance of{" "}
                      {formatCurrency(preview.balanceAfterCancel)}. You will
                      need to settle this before booking future lessons.
                    </Text>
                  </Alert>
                )}

                {preview.policyText && (
                  <Alert status="info" borderRadius="md" fontSize="sm">
                    <AlertIcon />
                    {preview.policyText}
                  </Alert>
                )}

                <FormControl>
                  <FormLabel fontSize="sm">Reason (optional)</FormLabel>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Let your instructor know why you're cancelling..."
                    size="sm"
                    rows={3}
                  />
                  <FormHelperText>
                    This will be shared with your instructor.
                  </FormHelperText>
                </FormControl>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Keep Lesson
            </Button>
            {preview?.allowLearnerCancellation && (
              <Button
                colorScheme="red"
                onClick={handleCancel}
                isLoading={cancelMutation.isPending}
                isDisabled={previewLoading || !!previewError}
              >
                {preview.fee > 0
                  ? `Cancel & Pay ${formatCurrency(preview.fee)}`
                  : "Cancel Lesson"}
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
