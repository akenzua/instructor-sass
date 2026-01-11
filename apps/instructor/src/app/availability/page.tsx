"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Skeleton,
  Switch,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Plus, Trash2, Save } from "lucide-react";
import { PageHeader } from "@acme/ui";
import { useAuth } from "@/lib/auth";
import { useWeeklyAvailability } from "@/hooks";
import { useUpdateWeeklyAvailability } from "@/hooks/mutations";
import { AppShell } from "@/components";

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

export default function AvailabilityPage() {
  const router = useRouter();
  const toast = useToast();
  const { instructor, isLoading: authLoading } = useAuth();
  
  const { data: weeklyData, isLoading: dataLoading } = useWeeklyAvailability();
  const updateMutation = useUpdateWeeklyAvailability();
  
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize state from API data
  useEffect(() => {
    if (weeklyData) {
      const mapped = DAYS_OF_WEEK.map((day) => {
        const existing = weeklyData.find((d) => d.dayOfWeek === day);
        return {
          dayOfWeek: day,
          isAvailable: existing?.isAvailable ?? true,
          slots: existing?.slots ?? [{ start: "09:00", end: "17:00" }],
        };
      });
      setAvailability(mapped);
      setHasChanges(false);
    }
  }, [weeklyData]);

  useEffect(() => {
    if (!authLoading && !instructor) {
      router.push("/login");
    }
  }, [authLoading, instructor, router]);

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

  if (authLoading || !instructor) {
    return (
      <Box minH="100vh" bg="bg.subtle" p={8}>
        <Skeleton height="600px" />
      </Box>
    );
  }

  return (
    <AppShell>
      <VStack spacing={6} align="stretch">
        <PageHeader
          title="Availability"
          subtitle="Set your weekly schedule for lessons"
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
      </VStack>
    </AppShell>
  );
}
