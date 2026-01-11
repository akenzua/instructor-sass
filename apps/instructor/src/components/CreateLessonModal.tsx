"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  FormErrorMessage,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
} from "@chakra-ui/react";
import { format, addMinutes, parse } from "date-fns";
import { useCreateLesson, useLearners } from "@/hooks";

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date | null;
}

interface FormData {
  learnerId: string;
  startTime: string;
  duration: number;
  type: string;
  price: number;
  pickupLocation: string;
  notes: string;
}

interface FormErrors {
  learnerId?: string;
  startTime?: string;
  duration?: string;
  price?: string;
}

const LESSON_TYPES = [
  { value: "standard", label: "Standard Lesson" },
  { value: "test-prep", label: "Test Preparation" },
  { value: "mock-test", label: "Mock Test" },
  { value: "motorway", label: "Motorway Lesson" },
  { value: "refresher", label: "Refresher Lesson" },
];

export function CreateLessonModal({
  isOpen,
  onClose,
  selectedDate,
}: CreateLessonModalProps) {
  const toast = useToast();
  const createMutation = useCreateLesson();
  const { data: learnersData, isLoading: learnersLoading } = useLearners({
    limit: 100,
    status: "active",
  });

  const [formData, setFormData] = useState<FormData>({
    learnerId: "",
    startTime: "",
    duration: 60,
    type: "standard",
    price: 45,
    pickupLocation: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Update startTime when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      // Format without seconds for datetime-local input
      setFormData((prev) => ({
        ...prev,
        startTime: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
      }));
    }
  }, [selectedDate]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.learnerId) {
      newErrors.learnerId = "Please select a learner";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (formData.duration < 30 || formData.duration > 180) {
      newErrors.duration = "Duration must be between 30 and 180 minutes";
    }

    if (formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      // Parse the datetime-local value as local time
      const startTime = parse(formData.startTime, "yyyy-MM-dd'T'HH:mm", new Date());
      const endTime = addMinutes(startTime, formData.duration);

      await createMutation.mutateAsync({
        learnerId: formData.learnerId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: formData.duration,
        type: formData.type as "standard" | "test-prep" | "mock-test" | "motorway" | "refresher",
        price: formData.price,
        pickupLocation: formData.pickupLocation || undefined,
        notes: formData.notes || undefined,
      });

      toast({
        title: "Lesson scheduled",
        description: "The lesson has been added to your calendar",
        status: "success",
        duration: 3000,
      });

      handleClose();
    } catch (error: any) {
      toast({
        title: "Failed to create lesson",
        description: error?.response?.data?.message || error?.message || "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleClose = () => {
    setFormData({
      learnerId: "",
      startTime: "",
      duration: 60,
      type: "standard",
      price: 45,
      pickupLocation: "",
      notes: "",
    });
    setErrors({});
    onClose();
  };

  const learners = learnersData?.items || [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Schedule New Lesson</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            {/* Learner Selection */}
            <FormControl isRequired isInvalid={!!errors.learnerId}>
              <FormLabel>Learner</FormLabel>
              <Select
                placeholder="Select a learner"
                value={formData.learnerId}
                onChange={(e) =>
                  setFormData({ ...formData, learnerId: e.target.value })
                }
                isDisabled={learnersLoading}
              >
                {learners.map((learner) => (
                  <option key={learner._id} value={learner._id}>
                    {learner.firstName} {learner.lastName}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.learnerId}</FormErrorMessage>
              {learners.length === 0 && !learnersLoading && (
                <Text fontSize="sm" color="orange.500" mt={1}>
                  No active learners. Add a learner first.
                </Text>
              )}
            </FormControl>

            {/* Date & Time */}
            <FormControl isRequired isInvalid={!!errors.startTime}>
              <FormLabel>Date & Time</FormLabel>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
              <FormErrorMessage>{errors.startTime}</FormErrorMessage>
            </FormControl>

            {/* Duration */}
            <FormControl isRequired isInvalid={!!errors.duration}>
              <FormLabel>Duration (minutes)</FormLabel>
              <NumberInput
                value={formData.duration}
                onChange={(_, value) =>
                  setFormData({ ...formData, duration: value || 60 })
                }
                min={30}
                max={180}
                step={15}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.duration}</FormErrorMessage>
            </FormControl>

            {/* Lesson Type */}
            <FormControl>
              <FormLabel>Lesson Type</FormLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                {LESSON_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Price */}
            <FormControl isInvalid={!!errors.price}>
              <FormLabel>Price (£)</FormLabel>
              <NumberInput
                value={formData.price}
                onChange={(_, value) =>
                  setFormData({ ...formData, price: value || 0 })
                }
                min={0}
                precision={2}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{errors.price}</FormErrorMessage>
            </FormControl>

            {/* Pickup Location */}
            <FormControl>
              <FormLabel>Pickup Location</FormLabel>
              <Input
                placeholder="Enter pickup address"
                value={formData.pickupLocation}
                onChange={(e) =>
                  setFormData({ ...formData, pickupLocation: e.target.value })
                }
              />
            </FormControl>

            {/* Notes */}
            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea
                placeholder="Any notes about this lesson"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="primary"
            onClick={handleSubmit}
            isLoading={createMutation.isPending}
            isDisabled={learners.length === 0}
          >
            Schedule Lesson
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
