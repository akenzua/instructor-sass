"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  SimpleGrid,
  Skeleton,
  Text,
  Textarea,
  VStack,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Car,
  BookOpen,
  Package,
  Check,
  Users,
  Search,
  Home,
} from "lucide-react";
import { PageHeader } from "@acme/ui";
import { useLearnerAuth } from "@/lib/auth";
import {
  useLearnerProfile,
  useInstructorAvailability,
  useInstructorPackages,
  useBookLesson,
  useBookPackage,
  useSwitchInstructor,
} from "@/hooks";
import { AppHeader } from "@/components/AppHeader";

// ─── Lesson type metadata ───────────────────────────────────────
const LESSON_TYPE_META: Record<string, { label: string; icon: typeof Car }> = {
  standard: { label: "Standard Lesson", icon: Car },
  "test-prep": { label: "Test Preparation", icon: BookOpen },
  "mock-test": { label: "Mock Test", icon: Clock },
  motorway: { label: "Motorway Lesson", icon: Car },
  refresher: { label: "Refresher Lesson", icon: Car },
};

function getLessonTypeMeta(type: string) {
  return (
    LESSON_TYPE_META[type] || {
      label: type
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: Car,
    }
  );
}

// ─── Format currency ────────────────────────────────────────────
function formatPrice(amount: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

// ─── Day helpers for availability display ───────────────────────
const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const DAY_ABBREV: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

// ─── Package Card ───────────────────────────────────────────────
function PackageCard({
  pkg,
  onSelect,
  isLoading,
}: {
  pkg: any;
  onSelect: () => void;
  isLoading: boolean;
}) {
  const pricePerLesson = pkg.price / pkg.lessonCount;

  return (
    <Card
      cursor="pointer"
      onClick={isLoading ? undefined : onSelect}
      _hover={{ borderColor: "brand.500", shadow: "md" }}
      transition="all 0.2s"
      border="1px solid"
      borderColor="gray.200"
    >
      <CardBody>
        <HStack justify="space-between" mb={2}>
          <Heading size="sm">{pkg.name}</Heading>
          {pkg.discountPercent > 0 && (
            <Badge colorScheme="green">{pkg.discountPercent}% off</Badge>
          )}
        </HStack>
        {pkg.description && (
          <Text fontSize="sm" color="gray.600" mb={3}>
            {pkg.description}
          </Text>
        )}
        <HStack justify="space-between" fontSize="sm">
          <Text color="gray.600">{pkg.lessonCount} lessons</Text>
          <VStack spacing={0} align="end">
            <Text fontWeight="bold" fontSize="lg" color="brand.600">
              {formatPrice(pkg.price)}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {formatPrice(pricePerLesson)}/lesson
            </Text>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
}

// ─── Main Booking Page ──────────────────────────────────────────
export default function BookingPage() {
  const router = useRouter();
  const toast = useToast();
  const {
    learner,
    isLoading: authLoading,
    isAuthenticated,
    logout,
  } = useLearnerAuth();
  const { profile } = useLearnerProfile(isAuthenticated);

  // Track selected instructor for booking
  const [selectedInstructorId, setSelectedInstructorId] = useState<
    string | undefined
  >();

  const { data: availabilityData, isLoading: availLoading } =
    useInstructorAvailability(isAuthenticated, selectedInstructorId);
  const { data: packages, isLoading: pkgLoading } =
    useInstructorPackages(isAuthenticated, selectedInstructorId);
  const bookLesson = useBookLesson();
  const bookPackage = useBookPackage();
  const switchInstructor = useSwitchInstructor();

  // Form state
  const [lessonType, setLessonType] = useState("standard");
  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  // Address / postcode state
  const [pickupPostcode, setPickupPostcode] = useState("");
  const [pickupAddressLine1, setPickupAddressLine1] = useState("");
  const [pickupAddressLine2, setPickupAddressLine2] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [isLookingUpPostcode, setIsLookingUpPostcode] = useState(false);
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [postcodeVerified, setPostcodeVerified] = useState(false);
  const [addressResults, setAddressResults] = useState<
    Array<{
      line_1: string;
      line_2: string;
      line_3: string;
      post_town: string;
      county: string;
      postcode: string;
    }>
  >([]);
  const [showAddressSelect, setShowAddressSelect] = useState(false);
  const [manualAddressEntry, setManualAddressEntry] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const instructor = availabilityData?.instructor;
  const weeklyAvailability = availabilityData?.weeklyAvailability || [];
  const unscheduledLessons = availabilityData?.unscheduledLessons || 0;
  const needsInstructor = availabilityData?.needsInstructor ?? false;
  const allInstructors = availabilityData?.allInstructors || [];
  const balance = profile?.balance ?? learner?.balance ?? 0;
  const computedSlots: Array<{ date: string; startTime: string; endTime: string }> =
    (availabilityData as any)?.availableSlots || [];

  // Derive lesson types from instructor pricing
  const lessonTypes = useMemo(() => {
    if (!instructor?.lessonTypes?.length) {
      return [
        {
          type: "standard",
          price: instructor?.hourlyRate || 45,
          duration: 60,
        },
      ];
    }
    return instructor.lessonTypes;
  }, [instructor]);

  // Current selected type config
  const selectedTypeConfig = useMemo(() => {
    return lessonTypes.find((lt) => lt.type === lessonType) || lessonTypes[0];
  }, [lessonTypes, lessonType]);

  // Calculate price
  const calculatedPrice = useMemo(() => {
    if (!selectedTypeConfig) return 0;
    return (
      selectedTypeConfig.price * (duration / (selectedTypeConfig.duration || 60))
    );
  }, [selectedTypeConfig, duration]);

  const canAfford = balance >= calculatedPrice;

  // Derive available dates from pre-computed slots (server handles overrides + booked lessons)
  const availableDates = useMemo(() => {
    const dateMap = new Map<string, { value: string; label: string }>();
    for (const slot of computedSlots) {
      if (!dateMap.has(slot.date)) {
        const d = new Date(slot.date + "T00:00:00");
        const label = d.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
        dateMap.set(slot.date, { value: slot.date, label });
      }
    }
    return Array.from(dateMap.values());
  }, [computedSlots]);

  // Derive available time slots for the selected date
  const availableTimeSlots = useMemo(() => {
    if (!date) return [];
    return computedSlots
      .filter((s) => s.date === date)
      .map((s) => {
        const [h, m] = s.startTime.split(":").map(Number);
        const label = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
        return { value: s.startTime, label };
      });
  }, [date, computedSlots]);

  // Reset time when date changes
  useEffect(() => {
    setTime("");
  }, [date]);

  // Build full address string from parts
  const fullPickupAddress = useMemo(() => {
    const parts = [pickupAddressLine1, pickupAddressLine2, pickupCity, pickupPostcode].filter(Boolean);
    return parts.join(", ");
  }, [pickupAddressLine1, pickupAddressLine2, pickupCity, pickupPostcode]);

  // Postcode lookup — same logic as public booking page
  const lookupPostcode = async () => {
    const postcode = pickupPostcode.trim().toUpperCase();
    if (!postcode) {
      setPostcodeError("Please enter a postcode");
      return;
    }

    setIsLookingUpPostcode(true);
    setPostcodeError(null);
    setAddressResults([]);
    setShowAddressSelect(false);

    try {
      const validateResponse = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
      );
      const validateData = await validateResponse.json();

      if (validateData.status !== 200 || !validateData.result) {
        setPostcodeError("Postcode not found. Please check and try again.");
        setIsLookingUpPostcode(false);
        return;
      }

      const postcodeInfo = validateData.result;
      const idealPostcodesKey = process.env.NEXT_PUBLIC_IDEAL_POSTCODES_API_KEY;
      let addressesFound = false;

      if (idealPostcodesKey) {
        try {
          const addressResponse = await fetch(
            `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(postcode)}?api_key=${idealPostcodesKey}`,
          );

          if (addressResponse.ok) {
            const addressData = await addressResponse.json();
            if (addressData.result && addressData.result.length > 0) {
              const addresses = addressData.result.map(
                (addr: {
                  line_1?: string;
                  line_2?: string;
                  line_3?: string;
                  post_town?: string;
                  county?: string;
                  postcode?: string;
                }) => ({
                  line_1: addr.line_1 || "",
                  line_2: addr.line_2 || "",
                  line_3: addr.line_3 || "",
                  post_town:
                    addr.post_town || postcodeInfo.admin_district || "",
                  county: addr.county || "",
                  postcode: addr.postcode || postcode,
                }),
              );
              setAddressResults(addresses);
              setShowAddressSelect(true);
              setPickupPostcode(postcode);
              setPickupCity(postcodeInfo.admin_district || "");
              addressesFound = true;
            }
          }
        } catch (err) {
          console.log("Ideal Postcodes API error:", err);
        }
      }

      if (!addressesFound) {
        setPickupPostcode(postcodeInfo.postcode);
        setPickupCity(
          postcodeInfo.admin_district || postcodeInfo.region || "",
        );
        setPostcodeVerified(true);
        setManualAddressEntry(true);
      }
    } catch {
      setPostcodeError("Failed to look up postcode. Please try again.");
      setPostcodeVerified(false);
    } finally {
      setIsLookingUpPostcode(false);
    }
  };

  const handleAddressSelect = (index: number) => {
    const address = addressResults[index];
    if (address) {
      setPickupAddressLine1(address.line_1);
      setPickupAddressLine2(
        [address.line_2, address.line_3].filter(Boolean).join(", "),
      );
      setPickupCity(address.post_town || pickupCity);
      setPickupPostcode(address.postcode || pickupPostcode);
      setShowAddressSelect(false);
      setPostcodeVerified(true);
      setManualAddressEntry(true);
    }
  };

  const handleSwitchInstructor = async (instructorId: string) => {
    setSelectedInstructorId(instructorId);
    switchInstructor.mutate(instructorId);
  };

  const handleBookLesson = async () => {
    if (!date || !time) {
      toast({
        title: "Please select a date and time",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const startTime = new Date(`${date}T${time}`).toISOString();
    await bookLesson.mutateAsync({
      startTime,
      duration,
      type: lessonType,
      instructorId: instructor?._id || selectedInstructorId,
      pickupLocation: fullPickupAddress || undefined,
      notes: notes || undefined,
    });

    router.push("/");
  };

  const handleBookPackage = async (packageId: string) => {
    await bookPackage.mutateAsync({
      packageId,
      notes: notes || undefined,
    });

    router.push("/");
  };

  if (authLoading || !isAuthenticated) {
    return (
      <Box minH="100vh" bg="bg.subtle" p={8}>
        <Skeleton height="400px" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg.subtle">
      <AppHeader profile={profile} learner={learner} onLogout={logout} />

      <Box maxW="container.xl" mx="auto" p={6}>
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft size={16} />}
          mb={4}
          onClick={() => router.push("/")}
        >
          Back to Dashboard
        </Button>

        <PageHeader
          title="Book a Lesson"
          description="Choose a lesson or package from your instructor"
        />

        {availLoading ? (
          <VStack spacing={4} mt={6}>
            <Skeleton height="200px" w="full" />
            <Skeleton height="300px" w="full" />
          </VStack>
        ) : needsInstructor ? (
          <Card mt={6}>
            <CardBody textAlign="center" py={10}>
              <Icon as={Users} boxSize={10} color="gray.400" mb={3} />
              <Heading size="sm" mb={2}>
                No Instructor Yet
              </Heading>
              <Text color="gray.600" fontSize="sm" mb={4}>
                You are not linked to any instructor yet. Search for
                instructors in your area to get started.
              </Text>
              <Button
                colorScheme="brand"
                leftIcon={<Search size={16} />}
                onClick={() => router.push("/search")}
              >
                Find an Instructor
              </Button>
            </CardBody>
          </Card>
        ) : !instructor ? (
          <Alert status="warning" mt={6} borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              Could not load instructor information. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* ── My Instructors (Accordion) ────────── */}
            {allInstructors.length > 0 && (
              <Box mt={6} mb={4}>
                <HStack justify="space-between" mb={3}>
                  <HStack spacing={2}>
                    <Icon as={Users} boxSize={4} color="gray.600" />
                    <Heading size="sm">My Instructors</Heading>
                    <Badge
                      colorScheme={balance > 0 ? "green" : "gray"}
                      fontSize="xs"
                      px={2}
                      borderRadius="full"
                    >
                      Balance: {formatPrice(balance)}
                    </Badge>
                  </HStack>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Search size={14} />}
                    onClick={() => router.push("/search")}
                  >
                    Find More
                  </Button>
                </HStack>

                <Accordion
                  allowToggle
                  defaultIndex={allInstructors.findIndex(
                    (ai) => ai.instructorId === instructor?._id,
                  )}
                >
                  {allInstructors.map((ai) => {
                    const isActive = instructor?._id === ai.instructorId;
                    const sortedAvail = [...weeklyAvailability].sort(
                      (a, b) =>
                        DAY_ORDER.indexOf(a.dayOfWeek) -
                        DAY_ORDER.indexOf(b.dayOfWeek),
                    );

                    return (
                      <AccordionItem
                        key={ai.instructorId}
                        border="1px solid"
                        borderColor={isActive ? "brand.400" : "gray.200"}
                        borderRadius="lg"
                        mb={3}
                        overflow="hidden"
                        bg={isActive ? "brand.50" : "white"}
                      >
                        <AccordionButton
                          py={3}
                          px={4}
                          _hover={{ bg: isActive ? "brand.50" : "gray.50" }}
                          onClick={() => {
                            if (!isActive) {
                              handleSwitchInstructor(ai.instructorId);
                            }
                          }}
                        >
                          <HStack flex={1} spacing={3}>
                            <Box flex={1} minW={0} textAlign="left">
                              <HStack spacing={2}>
                                <Text
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  noOfLines={1}
                                >
                                  {ai.name}
                                </Text>
                                {isActive && (
                                  <Badge
                                    colorScheme="brand"
                                    fontSize="2xs"
                                    borderRadius="full"
                                  >
                                    Active
                                  </Badge>
                                )}
                              </HStack>
                              <HStack spacing={3} fontSize="xs" color="gray.500">
                                <Text>
                                  {ai.totalLessons} lesson
                                  {ai.totalLessons !== 1 ? "s" : ""}
                                </Text>
                              </HStack>
                            </Box>
                          </HStack>
                          <AccordionIcon />
                        </AccordionButton>

                        <AccordionPanel pb={4} px={4}>
                          {isActive && instructor ? (
                            <VStack align="stretch" spacing={3}>
                              {instructor.bio && (
                                <Text fontSize="sm" color="gray.600">
                                  {instructor.bio}
                                </Text>
                              )}

                              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                {instructor.vehicleInfo && (
                                  <HStack fontSize="sm" color="gray.600">
                                    <Icon as={Car} boxSize={4} />
                                    <Text>
                                      {[
                                        instructor.vehicleInfo.make,
                                        instructor.vehicleInfo.model,
                                        instructor.vehicleInfo.transmission &&
                                          `(${instructor.vehicleInfo.transmission})`,
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    </Text>
                                  </HStack>
                                )}
                                {(instructor.serviceAreas ?? []).length > 0 && (
                                  <HStack fontSize="sm" color="gray.600">
                                    <Icon as={MapPin} boxSize={4} />
                                    <Text>
                                      {(instructor.serviceAreas ?? [])
                                        .map((a: any) => a.name)
                                        .join(", ")}
                                    </Text>
                                  </HStack>
                                )}
                              </SimpleGrid>

                              <Divider />
                              {unscheduledLessons > 0 && (
                                <Alert status="info" borderRadius="md" size="sm">
                                  <AlertIcon />
                                  <AlertDescription fontSize="sm">
                                    You have {unscheduledLessons} unscheduled
                                    package lesson
                                    {unscheduledLessons > 1 ? "s" : ""}
                                  </AlertDescription>
                                </Alert>
                              )}

                              <Divider />

                              {/* ── Booking Tabs (inside accordion) ── */}
                              <Tabs colorScheme="brand" variant="enclosed" size="sm">
                                <TabList>
                                  <Tab>
                                    <HStack spacing={2}>
                                      <Icon as={Calendar} boxSize={4} />
                                      <Text>Book Lesson</Text>
                                    </HStack>
                                  </Tab>
                                  <Tab>
                                    <HStack spacing={2}>
                                      <Icon as={Package} boxSize={4} />
                                      <Text>Packages</Text>
                                      {packages && packages.length > 0 && (
                                        <Badge colorScheme="brand" borderRadius="full">
                                          {packages.length}
                                        </Badge>
                                      )}
                                    </HStack>
                                  </Tab>
                                </TabList>

                                <TabPanels>
                                  {/* ── Book Lesson Tab ── */}
                                  <TabPanel px={0} pt={4}>
                                    <VStack spacing={5} align="stretch">
                                      {/* Lesson Type */}
                                      <Box>
                                        <Text fontWeight="medium" mb={2}>
                                          Lesson Type
                                        </Text>
                                        <SimpleGrid
                                          columns={{ base: 1, sm: 2, md: 3 }}
                                          spacing={3}
                                        >
                                          {lessonTypes.map((lt) => {
                                            const meta = getLessonTypeMeta(lt.type);
                                            const isSelected = lessonType === lt.type;
                                            return (
                                              <Card
                                                key={lt.type}
                                                cursor="pointer"
                                                onClick={() => {
                                                  setLessonType(lt.type);
                                                  setDuration(lt.duration || 60);
                                                }}
                                                border="2px solid"
                                                borderColor={
                                                  isSelected ? "brand.500" : "gray.200"
                                                }
                                                bg={isSelected ? "brand.50" : "white"}
                                                _hover={{ borderColor: "brand.300" }}
                                                transition="all 0.2s"
                                              >
                                                <CardBody py={3} px={4}>
                                                  <HStack justify="space-between">
                                                    <HStack spacing={2}>
                                                      <Icon
                                                        as={meta.icon}
                                                        boxSize={4}
                                                        color={
                                                          isSelected
                                                            ? "brand.600"
                                                            : "gray.500"
                                                        }
                                                      />
                                                      <Text fontSize="sm" fontWeight="medium">
                                                        {meta.label}
                                                      </Text>
                                                    </HStack>
                                                    <Text
                                                      fontSize="sm"
                                                      fontWeight="bold"
                                                      color="brand.600"
                                                    >
                                                      {formatPrice(lt.price)}
                                                    </Text>
                                                  </HStack>
                                                  {lt.description && (
                                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                                      {lt.description}
                                                    </Text>
                                                  )}
                                                </CardBody>
                                              </Card>
                                            );
                                          })}
                                        </SimpleGrid>
                                      </Box>

                                      {/* Duration */}
                                      <Box>
                                        <Text fontWeight="medium" mb={2}>
                                          Duration
                                        </Text>
                                        <HStack spacing={3} flexWrap="wrap">
                                          {[30, 60, 90, 120].map((d) => (
                                            <Button
                                              key={d}
                                              variant={duration === d ? "solid" : "outline"}
                                              colorScheme={duration === d ? "brand" : "gray"}
                                              size="sm"
                                              onClick={() => setDuration(d)}
                                            >
                                              {d >= 60
                                                ? `${d / 60}h${d % 60 ? ` ${d % 60}m` : ""}`
                                                : `${d}m`}
                                            </Button>
                                          ))}
                                        </HStack>
                                      </Box>

                                      {/* Date & Time */}
                                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                        <Box>
                                          <Text fontWeight="medium" mb={2}>Date</Text>
                                          <Select
                                            placeholder="Select a date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                          >
                                            {availableDates.map((d) => (
                                              <option key={d.value} value={d.value}>
                                                {d.label}
                                              </option>
                                            ))}
                                          </Select>
                                        </Box>
                                        <Box>
                                          <Text fontWeight="medium" mb={2}>Time</Text>
                                          <Select
                                            placeholder={date ? "Select a time" : "Pick a date first"}
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            isDisabled={!date || availableTimeSlots.length === 0}
                                          >
                                            {availableTimeSlots.map((s) => (
                                              <option key={s.value} value={s.value}>
                                                {s.label}
                                              </option>
                                            ))}
                                          </Select>
                                        </Box>
                                      </SimpleGrid>

                                      {/* Pickup Address */}
                                      <Box>
                                        <FormLabel fontSize="sm" fontWeight="medium" mb={2}>
                                          <HStack spacing={2}>
                                            <Icon as={Home} boxSize={4} color="gray.500" />
                                            <Text>Pickup Address (optional)</Text>
                                          </HStack>
                                        </FormLabel>

                                        {/* Postcode Lookup */}
                                        <HStack spacing={2} mb={3}>
                                          <FormControl flex={1}>
                                            <Input
                                              value={pickupPostcode}
                                              onChange={(e) => {
                                                setPickupPostcode(e.target.value.toUpperCase());
                                                setPostcodeVerified(false);
                                                setPostcodeError(null);
                                                setShowAddressSelect(false);
                                                setManualAddressEntry(false);
                                              }}
                                              placeholder="Enter postcode (e.g., SW1A 1AA)"
                                              size="sm"
                                              borderColor={
                                                postcodeVerified
                                                  ? "green.400"
                                                  : postcodeError
                                                    ? "red.400"
                                                    : undefined
                                              }
                                            />
                                          </FormControl>
                                          <Button
                                            colorScheme="brand"
                                            variant="outline"
                                            size="sm"
                                            onClick={lookupPostcode}
                                            isLoading={isLookingUpPostcode}
                                            leftIcon={<Search size={14} />}
                                            minW="120px"
                                          >
                                            Find Address
                                          </Button>
                                        </HStack>

                                        {postcodeError && (
                                          <Alert status="error" borderRadius="md" mb={3} py={2}>
                                            <AlertIcon boxSize={4} />
                                            <AlertDescription fontSize="sm">
                                              {postcodeError}
                                            </AlertDescription>
                                          </Alert>
                                        )}

                                        {/* Address Selection Dropdown */}
                                        {showAddressSelect && addressResults.length > 0 && (
                                          <Box mb={3}>
                                            <FormControl>
                                              <FormLabel fontSize="xs">Select your address</FormLabel>
                                              <Select
                                                placeholder={`${addressResults.length} addresses found`}
                                                size="sm"
                                                onChange={(e) =>
                                                  handleAddressSelect(parseInt(e.target.value, 10))
                                                }
                                              >
                                                {addressResults.map((addr, index) => (
                                                  <option key={index} value={index}>
                                                    {[addr.line_1, addr.line_2, addr.post_town]
                                                      .filter(Boolean)
                                                      .join(", ")}
                                                  </option>
                                                ))}
                                              </Select>
                                            </FormControl>
                                            <Button
                                              variant="link"
                                              size="xs"
                                              mt={1}
                                              color="brand.500"
                                              onClick={() => {
                                                setShowAddressSelect(false);
                                                setManualAddressEntry(true);
                                                setPostcodeVerified(true);
                                              }}
                                            >
                                              Can&apos;t find your address? Enter manually
                                            </Button>
                                          </Box>
                                        )}

                                        {postcodeVerified && !showAddressSelect && (
                                          <Alert status="success" borderRadius="md" mb={3} py={2}>
                                            <AlertIcon boxSize={4} />
                                            <AlertDescription fontSize="sm">
                                              {pickupAddressLine1
                                                ? `Selected: ${pickupAddressLine1}, ${pickupCity}`
                                                : `Postcode verified: ${pickupPostcode} — ${pickupCity}`}
                                            </AlertDescription>
                                          </Alert>
                                        )}

                                        {/* Address Fields */}
                                        {(manualAddressEntry || postcodeVerified) && (
                                          <VStack spacing={2}>
                                            <FormControl>
                                              <FormLabel fontSize="xs">Address Line 1</FormLabel>
                                              <Input
                                                value={pickupAddressLine1}
                                                onChange={(e) =>
                                                  setPickupAddressLine1(e.target.value)
                                                }
                                                placeholder="House number and street name"
                                                size="sm"
                                              />
                                            </FormControl>
                                            <FormControl>
                                              <FormLabel fontSize="xs">
                                                Address Line 2 (optional)
                                              </FormLabel>
                                              <Input
                                                value={pickupAddressLine2}
                                                onChange={(e) =>
                                                  setPickupAddressLine2(e.target.value)
                                                }
                                                placeholder="Flat, apartment, building"
                                                size="sm"
                                              />
                                            </FormControl>
                                            <SimpleGrid
                                              columns={{ base: 1, sm: 2 }}
                                              spacing={2}
                                              w="full"
                                            >
                                              <FormControl>
                                                <FormLabel fontSize="xs">City / Town</FormLabel>
                                                <Input
                                                  value={pickupCity}
                                                  onChange={(e) =>
                                                    setPickupCity(e.target.value)
                                                  }
                                                  placeholder="City or town"
                                                  size="sm"
                                                />
                                              </FormControl>
                                              <FormControl>
                                                <FormLabel fontSize="xs">Postcode</FormLabel>
                                                <Input
                                                  value={pickupPostcode}
                                                  isReadOnly
                                                  size="sm"
                                                  bg="gray.50"
                                                />
                                              </FormControl>
                                            </SimpleGrid>
                                          </VStack>
                                        )}
                                      </Box>

                                      {/* Notes */}
                                      <Box>
                                        <Text fontWeight="medium" mb={2}>
                                          Notes (optional)
                                        </Text>
                                        <Textarea
                                          placeholder="Anything your instructor should know..."
                                          value={notes}
                                          onChange={(e) => setNotes(e.target.value)}
                                          rows={3}
                                        />
                                      </Box>

                                      <Divider />

                                      {/* Summary */}
                                      <Box
                                        bg="gray.50"
                                        p={4}
                                        borderRadius="md"
                                        border="1px solid"
                                        borderColor="gray.200"
                                      >
                                        <HStack justify="space-between" mb={2}>
                                          <Text fontWeight="medium">
                                            {getLessonTypeMeta(lessonType).label} — {duration}min
                                          </Text>
                                          <Text fontWeight="bold" fontSize="lg" color="brand.600">
                                            {formatPrice(calculatedPrice)}
                                          </Text>
                                        </HStack>
                                        <HStack justify="space-between" fontSize="sm">
                                          <Text color="gray.600">Your balance</Text>
                                          <Text
                                            color={canAfford ? "green.600" : "red.600"}
                                            fontWeight="medium"
                                          >
                                            {formatPrice(balance)}
                                          </Text>
                                        </HStack>
                                        {!canAfford && (
                                          <Alert status="error" mt={3} borderRadius="md" size="sm">
                                            <AlertIcon />
                                            <AlertDescription fontSize="sm">
                                              Insufficient balance. You need{" "}
                                              {formatPrice(calculatedPrice - balance)} more.
                                            </AlertDescription>
                                          </Alert>
                                        )}
                                      </Box>

                                      {/* Actions */}
                                      <HStack spacing={3}>
                                        {!canAfford && (
                                          <Button
                                            variant="outline"
                                            colorScheme="brand"
                                            onClick={() => router.push(`/pay?instructorId=${instructor?._id || ""}`)}
                                          >
                                            Top Up Balance
                                          </Button>
                                        )}
                                        <Button
                                          colorScheme="brand"
                                          onClick={handleBookLesson}
                                          isLoading={bookLesson.isPending}
                                          isDisabled={!canAfford || !date || !time}
                                          flex={1}
                                          rightIcon={<Check size={16} />}
                                        >
                                          Confirm Booking
                                        </Button>
                                      </HStack>
                                    </VStack>
                                  </TabPanel>

                                  {/* ── Packages Tab ── */}
                                  <TabPanel px={0} pt={4}>
                                    {pkgLoading ? (
                                      <VStack spacing={4}>
                                        <Skeleton height="120px" w="full" />
                                        <Skeleton height="120px" w="full" />
                                      </VStack>
                                    ) : !packages || packages.length === 0 ? (
                                      <Box textAlign="center" py={8}>
                                        <Icon as={Package} boxSize={10} color="gray.400" mb={3} />
                                        <Heading size="sm" mb={2}>
                                          No Packages Available
                                        </Heading>
                                        <Text color="gray.600" fontSize="sm">
                                          This instructor hasn&apos;t created any packages yet.
                                          Try booking a single lesson instead.
                                        </Text>
                                      </Box>
                                    ) : (
                                      <VStack spacing={4} align="stretch">
                                        <Text color="gray.600" fontSize="sm">
                                          Save money by booking a bundle of lessons.
                                        </Text>

                                        <Box bg="gray.50" p={3} borderRadius="md" fontSize="sm">
                                          <HStack justify="space-between">
                                            <Text color="gray.600">Your balance</Text>
                                            <Text fontWeight="bold">
                                              {formatPrice(balance)}
                                            </Text>
                                          </HStack>
                                        </Box>

                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                          {packages.map((pkg) => (
                                            <PackageCard
                                              key={pkg._id}
                                              pkg={pkg}
                                              onSelect={() => handleBookPackage(pkg._id)}
                                              isLoading={bookPackage.isPending}
                                            />
                                          ))}
                                        </SimpleGrid>

                                        {packages.some((pkg) => pkg.price > balance) && (
                                          <Button
                                            variant="outline"
                                            colorScheme="brand"
                                            onClick={() => router.push(`/pay?instructorId=${instructor?._id || ""}`)}
                                            w="full"
                                          >
                                            Top Up Balance
                                          </Button>
                                        )}
                                      </VStack>
                                    )}
                                  </TabPanel>
                                </TabPanels>
                              </Tabs>
                            </VStack>
                          ) : (
                            <Text fontSize="sm" color="gray.500" fontStyle="italic">
                              Click to select this instructor and view their
                              availability.
                            </Text>
                          )}
                        </AccordionPanel>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
