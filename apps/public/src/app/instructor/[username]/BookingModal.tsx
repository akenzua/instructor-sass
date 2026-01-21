"use client";

import { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Portal,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
  HStack,
  Box,
  Badge,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, addDays, startOfDay } from "date-fns";
import { publicApi, type PublicInstructor, type AvailableSlot } from "@/lib/api";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: PublicInstructor;
}

interface BookingFormData {
  date: string;
  startTime: string;
  duration: number;
  lessonType: string;
  learnerEmail: string;
  learnerFirstName: string;
  learnerLastName: string;
  learnerPhone: string;
  pickupLocation: string;
  notes: string;
}

export function BookingModal({ isOpen, onClose, instructor }: BookingModalProps) {
  const toast = useToast();
  const [step, setStep] = useState(1); // 1: Select slot, 2: Enter details
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    date: "",
    startTime: "",
    duration: instructor.lessonTypes?.[0]?.duration || 60,
    lessonType: instructor.lessonTypes?.[0]?.type || "standard",
    learnerEmail: "",
    learnerFirstName: "",
    learnerLastName: "",
    learnerPhone: "",
    pickupLocation: "",
    notes: "",
  });

  // Get next 14 days for date selection
  const dateRange = {
    from: format(startOfDay(new Date()), "yyyy-MM-dd"),
    to: format(addDays(new Date(), 14), "yyyy-MM-dd"),
  };

  // Fetch available slots
  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ["slots", instructor.username, dateRange, formData.duration],
    queryFn: () =>
      publicApi.getAvailableSlots(instructor.username, {
        ...dateRange,
        duration: formData.duration,
      }),
    enabled: isOpen,
  });

  // Group slots by date
  const slotsByDate = slots?.reduce<Record<string, AvailableSlot[]>>((acc: Record<string, AvailableSlot[]>, slot: AvailableSlot) => {
    const date = slot.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {}) || {};

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: () =>
      publicApi.createBooking(instructor.username, {
        date: selectedSlot!.date,
        startTime: selectedSlot!.startTime,
        duration: formData.duration,
        lessonType: formData.lessonType,
        learnerEmail: formData.learnerEmail,
        learnerFirstName: formData.learnerFirstName,
        learnerLastName: formData.learnerLastName,
        learnerPhone: formData.learnerPhone || undefined,
        pickupLocation: formData.pickupLocation || undefined,
        notes: formData.notes || undefined,
      }),
    onSuccess: (data: { paymentUrl?: string }) => {
      toast({
        title: "Booking confirmed!",
        description: "Redirecting to payment...",
        status: "success",
        duration: 3000,
      });
      // Redirect to payment URL
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        onClose();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Please try again",
        status: "error",
        duration: 5000,
      });
    },
  });

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setFormData((prev) => ({
      ...prev,
      date: slot.date,
      startTime: slot.startTime,
    }));
    setStep(2);
  };

  const handleSubmit = () => {
    if (!selectedSlot) return;
    
    // Basic validation
    if (!formData.learnerEmail || !formData.learnerFirstName || !formData.learnerLastName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    bookingMutation.mutate();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedSlot(null);
    setFormData({
      date: "",
      startTime: "",
      duration: instructor.lessonTypes?.[0]?.duration || 60,
      lessonType: instructor.lessonTypes?.[0]?.type || "standard",
      learnerEmail: "",
      learnerFirstName: "",
      learnerLastName: "",
      learnerPhone: "",
      pickupLocation: "",
      notes: "",
    });
    onClose();
  };

  const selectedLessonType = instructor.lessonTypes?.find(
    (l) => l.type === formData.lessonType
  );

  return (
    <Portal>
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        size="xl" 
        isCentered 
        scrollBehavior="inside"
        blockScrollOnMount={true}
        closeOnOverlayClick={true}
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent mx={4} maxH="90vh">
          <ModalHeader>
            {step === 1 ? "Choose a Time Slot" : "Complete Your Booking"}
          </ModalHeader>
          <ModalCloseButton />

        <ModalBody>
          {step === 1 ? (
            <VStack spacing={4} align="stretch">
              {/* Lesson Type Selection */}
              <FormControl>
                <FormLabel>Lesson Type</FormLabel>
                <Select
                  value={formData.lessonType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const type = e.target.value;
                    const lesson = instructor.lessonTypes?.find((l) => l.type === type);
                    setFormData((prev) => ({
                      ...prev,
                      lessonType: type,
                      duration: lesson?.duration || 60,
                    }));
                  }}
                >
                  {instructor.lessonTypes?.map((lesson) => (
                    <option key={lesson.type} value={lesson.type}>
                      {lesson.type} - {lesson.duration}min - £{lesson.price}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Available Slots */}
              {slotsLoading ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="lg" />
                  <Text mt={2} color="gray.500">Loading available slots...</Text>
                </Box>
              ) : Object.keys(slotsByDate).length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  No available slots in the next 14 days. Please check back later.
                </Alert>
              ) : (
                <VStack spacing={4} align="stretch" maxH="400px" overflowY="auto">
                  {Object.entries(slotsByDate).map(([date, daySlots]) => (
                    <Box key={date}>
                      <Text fontWeight="semibold" mb={2}>
                        {format(new Date(date), "EEEE, MMMM d")}
                      </Text>
                      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
                        {(daySlots as AvailableSlot[]).map((slot: AvailableSlot, idx: number) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSlotSelect(slot)}
                            colorScheme={selectedSlot === slot ? "primary" : "gray"}
                          >
                            {slot.startTime}
                          </Button>
                        ))}
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              )}
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch">
              {/* Selected Slot Summary */}
              <Box p={4} bg="primary.50" borderRadius="md">
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">
                      {format(new Date(selectedSlot!.date), "EEEE, MMMM d, yyyy")}
                    </Text>
                    <Text color="gray.600">
                      {selectedSlot!.startTime} - {formData.duration} minutes
                    </Text>
                    <Badge colorScheme="primary" textTransform="capitalize">
                      {formData.lessonType} lesson
                    </Badge>
                  </VStack>
                  <VStack align="end">
                    <Text fontSize="2xl" fontWeight="bold" color="primary.500">
                      £{selectedLessonType?.price || 0}
                    </Text>
                    <Button size="xs" variant="link" onClick={() => setStep(1)}>
                      Change
                    </Button>
                  </VStack>
                </HStack>
              </Box>

              {/* Contact Details */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={formData.learnerFirstName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, learnerFirstName: e.target.value }))
                    }
                    placeholder="Your first name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={formData.learnerLastName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, learnerLastName: e.target.value }))
                    }
                    placeholder="Your last name"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.learnerEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, learnerEmail: e.target.value }))
                  }
                  placeholder="your@email.com"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone (optional)</FormLabel>
                <Input
                  type="tel"
                  value={formData.learnerPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, learnerPhone: e.target.value }))
                  }
                  placeholder="Your phone number"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Pickup Location</FormLabel>
                <Input
                  value={formData.pickupLocation}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pickupLocation: e.target.value }))
                  }
                  placeholder="Where should the instructor pick you up?"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes (optional)</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Any additional information for your instructor"
                  rows={3}
                />
              </FormControl>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          {step === 2 && (
            <>
              <Button variant="ghost" mr={3} onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                colorScheme="primary"
                onClick={handleSubmit}
                isLoading={bookingMutation.isPending}
              >
                Confirm & Pay £{selectedLessonType?.price || 0}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
    </Portal>
  );
}
