"use client";

import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
  HStack,
  Badge,
  useToast,
  Spinner,
  Card,
  CardBody,
  Heading,
  Icon,
  Flex,
  Divider,
  Circle,
} from "@chakra-ui/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, addDays, startOfDay, isSameDay, parseISO } from "date-fns";
import { publicApi, type PublicInstructor, type AvailableSlot } from "@/lib/api";
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle, User, Mail, Phone, MapPin, FileText } from "lucide-react";

interface InlineBookingSectionProps {
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

export function InlineBookingSection({ instructor }: InlineBookingSectionProps) {
  const toast = useToast();
  const [step, setStep] = useState(1); // 1: Select date/slot, 2: Enter details, 3: Confirm
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  
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

  // Generate dates for current view (2 weeks at a time)
  const baseDate = addDays(new Date(), weekOffset * 7);
  const visibleDates = Array.from({ length: 14 }, (_, i) => 
    format(addDays(startOfDay(baseDate), i), "yyyy-MM-dd")
  );

  // Get date range for API call
  const dateRange = {
    from: visibleDates[0],
    to: visibleDates[visibleDates.length - 1],
  };

  // Fetch available slots
  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ["slots", instructor.username, dateRange.from, dateRange.to, formData.duration],
    queryFn: () =>
      publicApi.getAvailableSlots(instructor.username, {
        ...dateRange,
        duration: formData.duration,
      }),
  });

  // Group slots by date
  const slotsByDate = slots?.reduce<Record<string, AvailableSlot[]>>((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {}) || {};

  // Get selected lesson type info
  const selectedLessonType = instructor.lessonTypes?.find(
    (l) => l.type === formData.lessonType
  );

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
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
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

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setFormData((prev) => ({
      ...prev,
      date: slot.date,
      startTime: slot.startTime,
    }));
  };

  const handleSubmit = () => {
    if (!selectedSlot) return;
    
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

  const canGoBack = weekOffset > 0;
  const canGoForward = weekOffset < 4; // Max 5 weeks ahead

  return (
    <Card bg="white" borderRadius="2xl" boxShadow="0 4px 20px rgba(0,0,0,0.08)" overflow="hidden">
      {/* Header */}
      <Box bg="linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)" p={6} color="white">
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="md" fontWeight="bold">Book Your Lesson</Heading>
            <Text opacity={0.9} fontSize="sm">Select a date and time that works for you</Text>
          </VStack>
          <VStack align="end" spacing={0}>
            <Text fontSize="2xl" fontWeight="bold">£{selectedLessonType?.price || instructor.hourlyRate || 45}</Text>
            <Text fontSize="xs" opacity={0.9}>per lesson</Text>
          </VStack>
        </HStack>
      </Box>

      <CardBody p={0}>
        {/* Progress Steps */}
        <HStack px={6} py={4} bg="gray.50" spacing={0}>
          {[
            { num: 1, label: "Select Time" },
            { num: 2, label: "Your Details" },
            { num: 3, label: "Confirm" },
          ].map((s, idx) => (
            <HStack key={s.num} flex={1} spacing={2}>
              <Circle
                size="28px"
                bg={step >= s.num ? "blue.500" : "gray.200"}
                color={step >= s.num ? "white" : "gray.500"}
                fontWeight="bold"
                fontSize="sm"
              >
                {step > s.num ? <CheckCircle size={14} /> : s.num}
              </Circle>
              <Text
                fontSize="sm"
                fontWeight={step === s.num ? "semibold" : "normal"}
                color={step >= s.num ? "gray.800" : "gray.500"}
                display={{ base: "none", sm: "block" }}
              >
                {s.label}
              </Text>
              {idx < 2 && <Box flex={1} h="2px" bg={step > s.num ? "blue.500" : "gray.200"} mx={2} />}
            </HStack>
          ))}
        </HStack>

        {/* Step 1: Select Date & Time */}
        {step === 1 && (
          <Box p={6}>
            {/* Lesson Type Selector */}
            <FormControl mb={6}>
              <FormLabel fontWeight="semibold">Lesson Type</FormLabel>
              <Select
                value={formData.lessonType}
                onChange={(e) => {
                  const type = e.target.value;
                  const lesson = instructor.lessonTypes?.find((l) => l.type === type);
                  setFormData((prev) => ({
                    ...prev,
                    lessonType: type,
                    duration: lesson?.duration || 60,
                  }));
                  setSelectedSlot(null);
                }}
                size="lg"
                borderRadius="xl"
              >
                {instructor.lessonTypes?.map((lesson) => (
                  <option key={lesson.type} value={lesson.type}>
                    {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} - {lesson.duration}min - £{lesson.price}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Calendar Navigation */}
            <HStack justify="space-between" mb={4}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ChevronLeft size={16} />}
                onClick={() => setWeekOffset(w => w - 1)}
                isDisabled={!canGoBack}
              >
                Earlier
              </Button>
              <Text fontWeight="semibold" color="gray.600">
                {format(parseISO(visibleDates[0]), "MMM d")} - {format(parseISO(visibleDates[visibleDates.length - 1]), "MMM d, yyyy")}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ChevronRight size={16} />}
                onClick={() => setWeekOffset(w => w + 1)}
                isDisabled={!canGoForward}
              >
                Later
              </Button>
            </HStack>

            {/* Date Grid */}
            {slotsLoading ? (
              <Flex justify="center" py={12}>
                <VStack spacing={3}>
                  <Spinner size="lg" color="blue.500" />
                  <Text color="gray.500">Loading available times...</Text>
                </VStack>
              </Flex>
            ) : (
              <>
                <SimpleGrid columns={7} spacing={2} mb={6}>
                  {visibleDates.map((date) => {
                    const dateSlots = slotsByDate[date] || [];
                    const hasSlots = dateSlots.length > 0;
                    const isSelected = selectedDate === date;
                    const dateObj = parseISO(date);
                    const isToday = isSameDay(dateObj, new Date());

                    return (
                      <Button
                        key={date}
                        variant={isSelected ? "solid" : "outline"}
                        colorScheme={isSelected ? "blue" : hasSlots ? "gray" : "gray"}
                        h="auto"
                        py={3}
                        px={2}
                        borderRadius="xl"
                        onClick={() => hasSlots && handleDateSelect(date)}
                        isDisabled={!hasSlots}
                        opacity={hasSlots ? 1 : 0.5}
                        flexDir="column"
                        gap={1}
                        _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                      >
                        <Text fontSize="xs" color={isSelected ? "white" : "gray.500"}>
                          {format(dateObj, "EEE")}
                        </Text>
                        <Text fontSize="lg" fontWeight="bold">
                          {format(dateObj, "d")}
                        </Text>
                        {isToday && (
                          <Badge
                            colorScheme={isSelected ? "whiteAlpha" : "blue"}
                            fontSize="8px"
                            borderRadius="full"
                          >
                            Today
                          </Badge>
                        )}
                        {hasSlots && !isToday && (
                          <Text fontSize="9px" color={isSelected ? "whiteAlpha.800" : "green.500"}>
                            {dateSlots.length} slots
                          </Text>
                        )}
                      </Button>
                    );
                  })}
                </SimpleGrid>

                {/* Time Slots for Selected Date */}
                {selectedDate && slotsByDate[selectedDate] && (
                  <Box>
                    <Text fontWeight="semibold" mb={3}>
                      Available times for {format(parseISO(selectedDate), "EEEE, MMMM d")}
                    </Text>
                    <SimpleGrid columns={{ base: 3, sm: 4, md: 5 }} spacing={2}>
                      {slotsByDate[selectedDate].map((slot, idx) => (
                        <Button
                          key={idx}
                          variant={selectedSlot === slot ? "solid" : "outline"}
                          colorScheme={selectedSlot === slot ? "blue" : "gray"}
                          size="md"
                          borderRadius="lg"
                          onClick={() => handleSlotSelect(slot)}
                        >
                          <HStack spacing={1}>
                            <Clock size={14} />
                            <Text>{slot.startTime}</Text>
                          </HStack>
                        </Button>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {!selectedDate && (
                  <Box textAlign="center" py={6} color="gray.500">
                    <Icon as={Calendar} boxSize={10} mb={3} />
                    <Text>Select a date above to see available times</Text>
                  </Box>
                )}
              </>
            )}

            {/* Continue Button */}
            {selectedSlot && (
              <Box mt={6}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  borderRadius="xl"
                  onClick={() => setStep(2)}
                  rightIcon={<ChevronRight size={18} />}
                >
                  Continue with {format(parseISO(selectedSlot.date), "EEE, MMM d")} at {selectedSlot.startTime}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Step 2: Enter Details */}
        {step === 2 && (
          <Box p={6}>
            {/* Selected Slot Summary */}
            <Card variant="filled" bg="blue.50" mb={6} borderRadius="xl">
              <CardBody py={4}>
                <Flex justify="space-between" align="center">
                  <HStack spacing={4}>
                    <Circle size="48px" bg="blue.100">
                      <Calendar size={24} color="#3182CE" />
                    </Circle>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold">
                        {format(parseISO(selectedSlot!.date), "EEEE, MMMM d, yyyy")}
                      </Text>
                      <HStack color="gray.600" fontSize="sm">
                        <Clock size={14} />
                        <Text>{selectedSlot!.startTime} • {formData.duration} minutes</Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  <VStack align="end" spacing={0}>
                    <Text fontSize="xl" fontWeight="bold" color="blue.600">
                      £{selectedLessonType?.price || 0}
                    </Text>
                    <Button size="xs" variant="link" colorScheme="blue" onClick={() => setStep(1)}>
                      Change
                    </Button>
                  </VStack>
                </Flex>
              </CardBody>
            </Card>

            {/* Contact Form */}
            <VStack spacing={4} align="stretch">
              <Heading size="sm" color="gray.700">Your Details</Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">First Name</FormLabel>
                  <Input
                    value={formData.learnerFirstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, learnerFirstName: e.target.value }))}
                    placeholder="John"
                    size="lg"
                    borderRadius="xl"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Last Name</FormLabel>
                  <Input
                    value={formData.learnerLastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, learnerLastName: e.target.value }))}
                    placeholder="Smith"
                    size="lg"
                    borderRadius="xl"
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Email</FormLabel>
                <Input
                  type="email"
                  value={formData.learnerEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, learnerEmail: e.target.value }))}
                  placeholder="john@example.com"
                  size="lg"
                  borderRadius="xl"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Phone (optional)</FormLabel>
                <Input
                  type="tel"
                  value={formData.learnerPhone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, learnerPhone: e.target.value }))}
                  placeholder="+44 7700 900000"
                  size="lg"
                  borderRadius="xl"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Pickup Location</FormLabel>
                <Input
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pickupLocation: e.target.value }))}
                  placeholder="Where should the instructor pick you up?"
                  size="lg"
                  borderRadius="xl"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Notes (optional)</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information for your instructor..."
                  rows={3}
                  borderRadius="xl"
                />
              </FormControl>
            </VStack>

            {/* Action Buttons */}
            <HStack mt={6} spacing={3}>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setStep(1)}
                leftIcon={<ChevronLeft size={18} />}
                borderRadius="xl"
              >
                Back
              </Button>
              <Button
                colorScheme="blue"
                size="lg"
                flex={1}
                borderRadius="xl"
                onClick={() => {
                  if (!formData.learnerEmail || !formData.learnerFirstName || !formData.learnerLastName) {
                    toast({
                      title: "Missing information",
                      description: "Please fill in all required fields",
                      status: "warning",
                      duration: 3000,
                    });
                    return;
                  }
                  setStep(3);
                }}
                rightIcon={<ChevronRight size={18} />}
              >
                Review Booking
              </Button>
            </HStack>
          </Box>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <Box p={6}>
            <Heading size="sm" mb={6} color="gray.700">Review Your Booking</Heading>

            <VStack spacing={4} align="stretch">
              {/* Lesson Details */}
              <Card variant="outline" borderRadius="xl">
                <CardBody>
                  <HStack spacing={4}>
                    <Circle size="48px" bg="blue.50">
                      <Calendar size={24} color="#3182CE" />
                    </Circle>
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="semibold">
                        {format(parseISO(selectedSlot!.date), "EEEE, MMMM d, yyyy")}
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        {selectedSlot!.startTime} • {formData.duration} min • {formData.lessonType} lesson
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              {/* Contact Details */}
              <Card variant="outline" borderRadius="xl">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <Icon as={User} color="gray.400" />
                      <Text>{formData.learnerFirstName} {formData.learnerLastName}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={Mail} color="gray.400" />
                      <Text>{formData.learnerEmail}</Text>
                    </HStack>
                    {formData.learnerPhone && (
                      <HStack>
                        <Icon as={Phone} color="gray.400" />
                        <Text>{formData.learnerPhone}</Text>
                      </HStack>
                    )}
                    {formData.pickupLocation && (
                      <HStack>
                        <Icon as={MapPin} color="gray.400" />
                        <Text>{formData.pickupLocation}</Text>
                      </HStack>
                    )}
                    {formData.notes && (
                      <HStack align="start">
                        <Icon as={FileText} color="gray.400" mt={1} />
                        <Text>{formData.notes}</Text>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Price Summary */}
              <Card bg="gray.50" borderRadius="xl">
                <CardBody>
                  <VStack spacing={2}>
                    <HStack justify="space-between" w="full">
                      <Text color="gray.600">{formData.lessonType} lesson ({formData.duration} min)</Text>
                      <Text fontWeight="medium">£{selectedLessonType?.price || 0}</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold" fontSize="lg">Total</Text>
                      <Text fontWeight="bold" fontSize="xl" color="blue.600">
                        £{selectedLessonType?.price || 0}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>

            {/* Action Buttons */}
            <HStack mt={6} spacing={3}>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setStep(2)}
                leftIcon={<ChevronLeft size={18} />}
                borderRadius="xl"
              >
                Back
              </Button>
              <Button
                colorScheme="blue"
                size="lg"
                flex={1}
                borderRadius="xl"
                onClick={handleSubmit}
                isLoading={bookingMutation.isPending}
                loadingText="Confirming..."
              >
                Confirm & Pay £{selectedLessonType?.price || 0}
              </Button>
            </HStack>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}
