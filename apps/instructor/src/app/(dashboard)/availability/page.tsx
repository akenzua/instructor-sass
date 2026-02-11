"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Skeleton,
  Switch,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { Plus, Trash2, Save, Calendar, X } from "lucide-react";
import { PageHeader } from "@acme/ui";
import { useWeeklyAvailability, useAvailabilityOverrides } from "@/hooks";
import { useUpdateWeeklyAvailability, useCreateAvailabilityOverride, useDeleteAvailabilityOverride } from "@/hooks/mutations";
import { format, parseISO } from "date-fns";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  dayOfWeek: string;
  isAvailable: boolean;
  slots: TimeSlot[];
}

interface OverrideFormData {
  date: string;
  isAvailable: boolean;
  reason: string;
  slots: TimeSlot[];
}

export default function AvailabilityPage() {
  const toast = useToast();
  const overrideModal = useDisclosure();
  
  const { data: weeklyData, isLoading: dataLoading, dataUpdatedAt } = useWeeklyAvailability();
  const { data: overridesData, isLoading: overridesLoading } = useAvailabilityOverrides();
  const updateMutation = useUpdateWeeklyAvailability();
  const createOverrideMutation = useCreateAvailabilityOverride();
  const deleteOverrideMutation = useDeleteAvailabilityOverride();
  
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [overrideForm, setOverrideForm] = useState<OverrideFormData>({
    date: "",
    isAvailable: false,
    reason: "",
    slots: [{ start: "09:00", end: "17:00" }],
  });

  // Initialize state from API data - use dataUpdatedAt to detect fresh data
  useEffect(() => {
    if (weeklyData) {
      const mapped = DAYS_OF_WEEK.map((day) => {
        const existing = weeklyData.find((d) => d.dayOfWeek === day);
        return {
          dayOfWeek: day,
          isAvailable: existing?.isAvailable ?? false, // Default to false for missing days
          slots: existing?.slots ?? [{ start: "09:00", end: "17:00" }],
        };
      });
      setAvailability(mapped);
      setHasChanges(false);
    }
  }, [weeklyData, dataUpdatedAt]);

  const toggleDayAvailable = (dayOfWeek: string) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, isAvailable: !d.isAvailable } : d
      )
    );
    setHasChanges(true);
  };

  const addSlot = (dayOfWeek: string) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? { ...d, slots: [...d.slots, { start: "09:00", end: "17:00" }] }
          : d
      )
    );
    setHasChanges(true);
  };

  const removeSlot = (dayOfWeek: string, index: number) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? { ...d, slots: d.slots.filter((_, i) => i !== index) }
          : d
      )
    );
    setHasChanges(true);
  };

  const updateSlot = (
    dayOfWeek: string,
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? {
              ...d,
              slots: d.slots.map((s, i) =>
                i === index ? { ...s, [field]: value } : s
              ),
            }
          : d
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(availability);
      toast({
        title: "Availability updated",
        description: "Your weekly availability has been saved.",
        status: "success",
        duration: 3000,
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save availability. Please try again.",
        status: "error",
        duration: 5000,
      });
    }
  };

  const openOverrideModal = () => {
    setOverrideForm({
      date: "",
      isAvailable: false,
      reason: "",
      slots: [{ start: "09:00", end: "17:00" }],
    });
    overrideModal.onOpen();
  };

  const handleCreateOverride = async () => {
    if (!overrideForm.date) {
      toast({
        title: "Date required",
        description: "Please select a date for the override.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await createOverrideMutation.mutateAsync({
        date: overrideForm.date,
        isAvailable: overrideForm.isAvailable,
        reason: overrideForm.reason || undefined,
        slots: overrideForm.isAvailable ? overrideForm.slots : undefined,
      });
      toast({
        title: "Override created",
        description: `Availability override for ${format(parseISO(overrideForm.date), "MMMM d, yyyy")} has been saved.`,
        status: "success",
        duration: 3000,
      });
      overrideModal.onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create override. Please try again.",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleDeleteOverride = async (date: string) => {
    try {
      await deleteOverrideMutation.mutateAsync(date);
      toast({
        title: "Override deleted",
        description: "The availability override has been removed.",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete override. Please try again.",
        status: "error",
        duration: 5000,
      });
    }
  };

  const addOverrideSlot = () => {
    setOverrideForm((prev) => ({
      ...prev,
      slots: [...prev.slots, { start: "09:00", end: "17:00" }],
    }));
  };

  const removeOverrideSlot = (index: number) => {
    setOverrideForm((prev) => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index),
    }));
  };

  const updateOverrideSlot = (index: number, field: "start" | "end", value: string) => {
    setOverrideForm((prev) => ({
      ...prev,
      slots: prev.slots.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  return (
    <>
      <VStack spacing={6} align="stretch">
        <PageHeader
          title="Availability"
          description="Set your weekly schedule for lessons"
          actions={
            <Button
              leftIcon={<Save size={16} />}
              colorScheme="primary"
              isLoading={updateMutation.isPending}
              isDisabled={!hasChanges}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          }
        />

        {dataLoading ? (
          <Skeleton height="600px" borderRadius="lg" />
        ) : (
          <Grid
            templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
            gap={4}
          >
            {availability.map((day) => (
              <GridItem key={day.dayOfWeek}>
                <Card
                  bg="bg.surface"
                  border="1px solid"
                  borderColor="border.subtle"
                >
                  <CardHeader pb={2}>
                    <Flex justify="space-between" align="center">
                      <Heading size="sm">{DAY_LABELS[day.dayOfWeek]}</Heading>
                      <HStack spacing={2}>
                        <Text fontSize="sm" color="fg.muted">
                          {day.isAvailable ? "Available" : "Unavailable"}
                        </Text>
                        <Switch
                          colorScheme="primary"
                          isChecked={day.isAvailable}
                          onChange={() => toggleDayAvailable(day.dayOfWeek)}
                        />
                      </HStack>
                    </Flex>
                  </CardHeader>
                  <CardBody pt={2}>
                    {day.isAvailable ? (
                      <VStack spacing={3} align="stretch">
                        {day.slots.map((slot, index) => (
                          <HStack key={index} spacing={2}>
                            <Input
                              type="time"
                              size="sm"
                              value={slot.start}
                              onChange={(e) =>
                                updateSlot(day.dayOfWeek, index, "start", e.target.value)
                              }
                            />
                            <Text color="fg.muted">to</Text>
                            <Input
                              type="time"
                              size="sm"
                              value={slot.end}
                              onChange={(e) =>
                                updateSlot(day.dayOfWeek, index, "end", e.target.value)
                              }
                            />
                            <IconButton
                              aria-label="Remove slot"
                              icon={<Trash2 size={14} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              isDisabled={day.slots.length === 1}
                              onClick={() => removeSlot(day.dayOfWeek, index)}
                            />
                          </HStack>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Plus size={14} />}
                          onClick={() => addSlot(day.dayOfWeek)}
                        >
                          Add Time Slot
                        </Button>
                      </VStack>
                    ) : (
                      <Text color="fg.muted" fontSize="sm">
                        You are not available on this day.
                      </Text>
                    )}
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        )}

        {/* Date-Specific Overrides Section */}
        <Box mt={8}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading size="md">Date-Specific Overrides</Heading>
              <Text fontSize="sm" color="fg.muted">
                Set custom availability for specific dates (holidays, appointments, etc.)
              </Text>
            </Box>
            <Button
              leftIcon={<Calendar size={16} />}
              colorScheme="primary"
              variant="outline"
              onClick={openOverrideModal}
            >
              Add Override
            </Button>
          </Flex>

          {overridesLoading ? (
            <Skeleton height="100px" borderRadius="lg" />
          ) : overridesData && overridesData.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {overridesData.map((override) => (
                <Card
                  key={override.date}
                  bg="bg.surface"
                  border="1px solid"
                  borderColor="border.subtle"
                >
                  <CardBody py={3}>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={4}>
                        <Box>
                          <Text fontWeight="medium">
                            {format(parseISO(override.date), "EEEE, MMMM d, yyyy")}
                          </Text>
                          {override.reason && (
                            <Text fontSize="sm" color="fg.muted">
                              {override.reason}
                            </Text>
                          )}
                        </Box>
                        <Badge
                          colorScheme={override.isAvailable ? "green" : "red"}
                          variant="subtle"
                        >
                          {override.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                        {override.isAvailable && override.slots?.length > 0 && (
                          <Text fontSize="sm" color="fg.muted">
                            {override.slots.map((s) => `${s.start}-${s.end}`).join(", ")}
                          </Text>
                        )}
                      </HStack>
                      <IconButton
                        aria-label="Delete override"
                        icon={<X size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        isLoading={deleteOverrideMutation.isPending}
                        onClick={() => handleDeleteOverride(override.date)}
                      />
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          ) : (
            <Card bg="bg.surface" border="1px solid" borderColor="border.subtle">
              <CardBody>
                <Text color="fg.muted" textAlign="center">
                  No date-specific overrides set. Your weekly schedule will apply to all dates.
                </Text>
              </CardBody>
            </Card>
          )}
        </Box>
      </VStack>

      {/* Create Override Modal */}
      <Modal isOpen={overrideModal.isOpen} onClose={overrideModal.onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Availability Override</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={overrideForm.date}
                  onChange={(e) =>
                    setOverrideForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </FormControl>

              <FormControl>
                <Flex justify="space-between" align="center">
                  <FormLabel mb={0}>Available on this date?</FormLabel>
                  <Switch
                    colorScheme="primary"
                    isChecked={overrideForm.isAvailable}
                    onChange={(e) =>
                      setOverrideForm((prev) => ({
                        ...prev,
                        isAvailable: e.target.checked,
                      }))
                    }
                  />
                </Flex>
              </FormControl>

              {overrideForm.isAvailable && (
                <FormControl>
                  <FormLabel>Time Slots</FormLabel>
                  <VStack spacing={2} align="stretch">
                    {overrideForm.slots.map((slot, index) => (
                      <HStack key={index} spacing={2}>
                        <Input
                          type="time"
                          size="sm"
                          value={slot.start}
                          onChange={(e) =>
                            updateOverrideSlot(index, "start", e.target.value)
                          }
                        />
                        <Text color="fg.muted">to</Text>
                        <Input
                          type="time"
                          size="sm"
                          value={slot.end}
                          onChange={(e) =>
                            updateOverrideSlot(index, "end", e.target.value)
                          }
                        />
                        <IconButton
                          aria-label="Remove slot"
                          icon={<Trash2 size={14} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          isDisabled={overrideForm.slots.length === 1}
                          onClick={() => removeOverrideSlot(index)}
                        />
                      </HStack>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Plus size={14} />}
                      onClick={addOverrideSlot}
                    >
                      Add Time Slot
                    </Button>
                  </VStack>
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Reason (optional)</FormLabel>
                <Textarea
                  placeholder="e.g., Holiday, Doctor's appointment, Personal day..."
                  value={overrideForm.reason}
                  onChange={(e) =>
                    setOverrideForm((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  rows={2}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={overrideModal.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              isLoading={createOverrideMutation.isPending}
              onClick={handleCreateOverride}
            >
              Save Override
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
