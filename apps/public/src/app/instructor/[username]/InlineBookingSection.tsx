'use client';

import { useState, useEffect } from 'react';
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
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { format, addDays, startOfDay, isSameDay, parseISO } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  useAvailableSlots,
  useCreateBooking,
  useConfirmBookingPayment,
  type PublicInstructor,
  type AvailableSlot,
} from '@/lib/api';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Lock,
  Search,
  Home,
} from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

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
  // Address fields
  pickupPostcode: string;
  pickupAddressLine1: string;
  pickupAddressLine2: string;
  pickupCity: string;
}

interface PostcodeLookupResult {
  postcode: string;
  admin_district: string;
  admin_ward: string;
  parish: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface AddressResult {
  line_1: string;
  line_2: string;
  line_3: string;
  post_town: string;
  county: string;
  postcode: string;
  formatted_address: string[];
}

export function InlineBookingSection({ instructor }: InlineBookingSectionProps) {
  const toast = useToast();
  const [step, setStep] = useState(1); // 1: Select date/slot, 2: Enter details, 3: Confirm, 4: Payment, 5: Success
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  
  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    date: '',
    startTime: '',
    duration: instructor.lessonTypes?.[0]?.duration || 60,
    lessonType: instructor.lessonTypes?.[0]?.type || 'standard',
    learnerEmail: '',
    learnerFirstName: '',
    learnerLastName: '',
    learnerPhone: '',
    pickupLocation: '',
    notes: '',
    pickupPostcode: '',
    pickupAddressLine1: '',
    pickupAddressLine2: '',
    pickupCity: '',
  });

  // Postcode lookup state
  const [isLookingUpPostcode, setIsLookingUpPostcode] = useState(false);
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [postcodeVerified, setPostcodeVerified] = useState(false);
  const [addressResults, setAddressResults] = useState<AddressResult[]>([]);
  const [showAddressSelect, setShowAddressSelect] = useState(false);
  const [manualAddressEntry, setManualAddressEntry] = useState(false);

  // Postcode lookup function - finds addresses for a postcode
  const lookupPostcode = async () => {
    const postcode = formData.pickupPostcode.trim().toUpperCase();
    if (!postcode) {
      setPostcodeError('Please enter a postcode');
      return;
    }

    setIsLookingUpPostcode(true);
    setPostcodeError(null);
    setAddressResults([]);
    setShowAddressSelect(false);

    try {
      // First validate the postcode with postcodes.io
      const validateResponse = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
      const validateData = await validateResponse.json();

      if (validateData.status !== 200 || !validateData.result) {
        setPostcodeError('Postcode not found. Please check and try again.');
        setIsLookingUpPostcode(false);
        return;
      }

      const postcodeInfo: PostcodeLookupResult = validateData.result;

      // Try to get addresses using Ideal Postcodes API (free tier available)
      const idealPostcodesKey = process.env.NEXT_PUBLIC_IDEAL_POSTCODES_API_KEY;
      
      let addressesFound = false;
      
      // Try Ideal Postcodes (generous free tier - sign up at ideal-postcodes.co.uk)
      if (idealPostcodesKey && !addressesFound) {
        try {
          const addressResponse = await fetch(
            `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(postcode)}?api_key=${idealPostcodesKey}`
          );
          
          if (addressResponse.ok) {
            const addressData = await addressResponse.json();
            
            if (addressData.result && addressData.result.length > 0) {
              const addresses: AddressResult[] = addressData.result.map((addr: {
                line_1?: string;
                line_2?: string;
                line_3?: string;
                post_town?: string;
                county?: string;
                postcode?: string;
              }) => ({
                line_1: addr.line_1 || '',
                line_2: addr.line_2 || '',
                line_3: addr.line_3 || '',
                post_town: addr.post_town || postcodeInfo.admin_district || '',
                county: addr.county || '',
                postcode: addr.postcode || postcode,
                formatted_address: [addr.line_1, addr.line_2, addr.post_town].filter(Boolean),
              }));
              
              setAddressResults(addresses);
              setShowAddressSelect(true);
              setFormData((prev) => ({
                ...prev,
                pickupPostcode: postcode,
                pickupCity: postcodeInfo.admin_district || '',
              }));
              addressesFound = true;
            }
          }
        } catch (err) {
          console.log('Ideal Postcodes API error:', err);
        }
      }
      
      // Fallback: Use postcode validation data and manual entry
      if (!addressesFound) {
        setFormData((prev) => ({
          ...prev,
          pickupPostcode: postcodeInfo.postcode,
          pickupCity: postcodeInfo.admin_district || postcodeInfo.region || '',
        }));
        setPostcodeVerified(true);
        setManualAddressEntry(true);
      }
    } catch (error) {
      setPostcodeError('Failed to look up postcode. Please try again.');
      setPostcodeVerified(false);
    } finally {
      setIsLookingUpPostcode(false);
    }
  };

  // Handle address selection from dropdown
  const handleAddressSelect = (index: number) => {
    const address = addressResults[index];
    if (address) {
      setFormData((prev) => ({
        ...prev,
        pickupAddressLine1: address.line_1,
        pickupAddressLine2: [address.line_2, address.line_3].filter(Boolean).join(', '),
        pickupCity: address.post_town || prev.pickupCity,
        pickupPostcode: address.postcode || prev.pickupPostcode,
      }));
      setShowAddressSelect(false);
      setPostcodeVerified(true);
      setManualAddressEntry(true);
    }
  };

  // Build full address string
  const getFullAddress = () => {
    const parts = [
      formData.pickupAddressLine1,
      formData.pickupAddressLine2,
      formData.pickupCity,
      formData.pickupPostcode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  useEffect(() => {
    setNow(new Date());
  }, []);

  // Generate dates for current view (2 weeks at a time)
  const baseDate = now ? addDays(now, weekOffset * 7) : addDays(new Date(), weekOffset * 7);
  const visibleDates = Array.from({ length: 14 }, (_, i) =>
    format(addDays(startOfDay(baseDate), i), 'yyyy-MM-dd')
  );

  // Get date range for API call
  const dateRange = {
    from: visibleDates[0],
    to: visibleDates[visibleDates.length - 1],
  };

  // Fetch available slots
  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(instructor.username, {
    ...dateRange,
    duration: formData.duration,
  });

  // Group slots by date
  const slotsByDate =
    slots?.reduce<Record<string, AvailableSlot[]>>((acc, slot) => {
      const date = slot.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(slot);
      return acc;
    }, {}) || {};

  // Get selected lesson type info
  const selectedLessonType = instructor.lessonTypes?.find((l) => l.type === formData.lessonType);

  // Booking mutation
  const bookingMutation = useCreateBooking(instructor.username);

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
        title: 'Missing information',
        description: 'Please fill in all required fields',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Calculate endTime from startTime and duration
    const [hours, minutes] = selectedSlot.startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + formData.duration * 60000);
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    bookingMutation.mutate(
      {
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime,
        learnerEmail: formData.learnerEmail,
        learnerFirstName: formData.learnerFirstName,
        learnerLastName: formData.learnerLastName,
        learnerPhone: formData.learnerPhone || undefined,
        pickupLocation: formData.pickupLocation || undefined,
        notes: formData.notes || undefined,
      },
      {
        onSuccess: (data) => {
          if (data.requiresPayment && data.clientSecret) {
            // Move to payment step
            setClientSecret(data.clientSecret);
            setPaymentIntentId(data.paymentIntentId);
            setBookingId(data.bookingId);
            setStep(4); // Payment step
          } else {
            // Fallback for non-payment flow
            setStep(5); // Success
            toast({
              title: 'Booking submitted!',
              description: 'Your booking has been submitted',
              status: 'success',
              duration: 3000,
            });
          }
        },
        onError: (error: Error) => {
          toast({
            title: 'Booking failed',
            description: error instanceof Error ? error.message : 'Please try again',
            status: 'error',
            duration: 5000,
          });
        },
      }
    );
  };

  const canGoBack = weekOffset > 0;
  const canGoForward = weekOffset < 4; // Max 5 weeks ahead

  return (
    <Card bg="white" borderRadius="2xl" boxShadow="0 4px 20px rgba(0,0,0,0.08)" overflow="hidden">
      {/* Header */}
      <Box bg="linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)" p={6} color="white">
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="md" fontWeight="bold">
              Book Your Lesson
            </Heading>
            <Text opacity={0.9} fontSize="sm">
              Select a date and time that works for you
            </Text>
          </VStack>
          <VStack align="end" spacing={0}>
            <Text fontSize="2xl" fontWeight="bold">
              £{selectedLessonType?.price || instructor.hourlyRate || 45}
            </Text>
            <Text fontSize="xs" opacity={0.9}>
              per lesson
            </Text>
          </VStack>
        </HStack>
      </Box>

      <CardBody p={0}>
        {/* Progress Steps */}
        <HStack px={6} py={4} bg="gray.50" spacing={0}>
          {[
            { num: 1, label: 'Select Time' },
            { num: 2, label: 'Your Details' },
            { num: 3, label: 'Payment' },
            { num: 4, label: 'Confirm' },
          ].map((s, idx) => (
            <HStack key={s.num} flex={1} spacing={2}>
              <Circle
                size="28px"
                bg={step >= s.num || step === 5 ? 'blue.500' : 'gray.200'}
                color={step >= s.num || step === 5 ? 'white' : 'gray.500'}
                fontWeight="bold"
                fontSize="sm"
              >
                {step > s.num || step === 5 ? <CheckCircle size={14} /> : s.num}
              </Circle>
              <Text
                fontSize="xs"
                fontWeight={step === s.num ? 'semibold' : 'normal'}
                color={step >= s.num || step === 5 ? 'gray.800' : 'gray.500'}
                display={{ base: 'none', md: 'block' }}
              >
                {s.label}
              </Text>
              {idx < 3 && (
                <Box flex={1} h="2px" bg={step > s.num || step === 5 ? 'blue.500' : 'gray.200'} mx={2} />
              )}
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
                    {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} - {lesson.duration}
                    min - £{lesson.price}
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
                onClick={() => setWeekOffset((w) => w - 1)}
                isDisabled={!canGoBack}
              >
                Earlier
              </Button>
              <Text fontWeight="semibold" color="gray.600">
                {format(parseISO(visibleDates[0]), 'MMM d')} -{' '}
                {format(parseISO(visibleDates[visibleDates.length - 1]), 'MMM d, yyyy')}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ChevronRight size={16} />}
                onClick={() => setWeekOffset((w) => w + 1)}
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
                    const isToday = isMounted && isSameDay(dateObj, new Date());

                    return (
                      <Button
                        key={date}
                        variant={isSelected ? 'solid' : 'outline'}
                        colorScheme={isSelected ? 'blue' : hasSlots ? 'gray' : 'gray'}
                        h="auto"
                        py={3}
                        px={2}
                        borderRadius="xl"
                        onClick={() => hasSlots && handleDateSelect(date)}
                        isDisabled={!hasSlots}
                        opacity={hasSlots ? 1 : 0.5}
                        flexDir="column"
                        gap={1}
                        _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
                      >
                        <Text fontSize="xs" color={isSelected ? 'white' : 'gray.500'}>
                          {format(dateObj, 'EEE')}
                        </Text>
                        <Text fontSize="lg" fontWeight="bold">
                          {format(dateObj, 'd')}
                        </Text>
                        {isToday && (
                          <Badge
                            colorScheme={isSelected ? 'whiteAlpha' : 'blue'}
                            fontSize="8px"
                            borderRadius="full"
                          >
                            Today
                          </Badge>
                        )}
                        {hasSlots && !isToday && (
                          <Text fontSize="9px" color={isSelected ? 'whiteAlpha.800' : 'green.500'}>
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
                      Available times for {format(parseISO(selectedDate), 'EEEE, MMMM d')}
                    </Text>
                    <SimpleGrid columns={{ base: 3, sm: 4, md: 5 }} spacing={2}>
                      {slotsByDate[selectedDate].map((slot, idx) => (
                        <Button
                          key={idx}
                          variant={selectedSlot === slot ? 'solid' : 'outline'}
                          colorScheme={selectedSlot === slot ? 'blue' : 'gray'}
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
                  Continue with {format(parseISO(selectedSlot.date), 'EEE, MMM d')} at{' '}
                  {selectedSlot.startTime}
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
                        {format(parseISO(selectedSlot!.date), 'EEEE, MMMM d, yyyy')}
                      </Text>
                      <HStack color="gray.600" fontSize="sm">
                        <Clock size={14} />
                        <Text>
                          {selectedSlot!.startTime} • {formData.duration} minutes
                        </Text>
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
              <Heading size="sm" color="gray.700">
                Your Details
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">First Name</FormLabel>
                  <Input
                    value={formData.learnerFirstName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, learnerFirstName: e.target.value }))
                    }
                    placeholder="John"
                    size="lg"
                    borderRadius="xl"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Last Name</FormLabel>
                  <Input
                    value={formData.learnerLastName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, learnerLastName: e.target.value }))
                    }
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, learnerEmail: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, learnerPhone: e.target.value }))
                  }
                  placeholder="+44 7700 900000"
                  size="lg"
                  borderRadius="xl"
                />
              </FormControl>

              {/* Pickup Address Section */}
              <Box>
                <FormLabel fontSize="sm" mb={3}>
                  <HStack spacing={2}>
                    <Icon as={Home} boxSize={4} color="gray.500" />
                    <Text>Pickup Address</Text>
                  </HStack>
                </FormLabel>
                
                {/* Postcode Lookup */}
                <HStack spacing={2} mb={3}>
                  <FormControl flex={1}>
                    <Input
                      value={formData.pickupPostcode}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, pickupPostcode: e.target.value.toUpperCase() }));
                        setPostcodeVerified(false);
                        setPostcodeError(null);
                        setShowAddressSelect(false);
                        setManualAddressEntry(false);
                      }}
                      placeholder="Enter postcode (e.g., SW1A 1AA)"
                      size="lg"
                      borderRadius="xl"
                      borderColor={postcodeVerified ? 'green.400' : postcodeError ? 'red.400' : undefined}
                      _focus={{
                        borderColor: postcodeVerified ? 'green.500' : postcodeError ? 'red.500' : 'blue.500',
                      }}
                    />
                  </FormControl>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    size="lg"
                    borderRadius="xl"
                    onClick={lookupPostcode}
                    isLoading={isLookingUpPostcode}
                    leftIcon={<Search size={16} />}
                    minW="140px"
                  >
                    Find Address
                  </Button>
                </HStack>

                {postcodeError && (
                  <Alert status="error" borderRadius="lg" mb={3} py={2}>
                    <AlertIcon boxSize={4} />
                    <AlertDescription fontSize="sm">{postcodeError}</AlertDescription>
                  </Alert>
                )}

                {/* Address Selection Dropdown */}
                {showAddressSelect && addressResults.length > 0 && (
                  <Box mb={3}>
                    <FormControl>
                      <FormLabel fontSize="sm">Select your address</FormLabel>
                      <Select
                        placeholder={`${addressResults.length} addresses found - select yours`}
                        size="lg"
                        borderRadius="xl"
                        onChange={(e) => handleAddressSelect(parseInt(e.target.value, 10))}
                      >
                        {addressResults.map((addr, index) => (
                          <option key={index} value={index}>
                            {[addr.line_1, addr.line_2, addr.post_town].filter(Boolean).join(', ')}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="link"
                      size="sm"
                      mt={2}
                      color="blue.500"
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
                  <Alert status="success" borderRadius="lg" mb={3} py={2}>
                    <AlertIcon boxSize={4} />
                    <AlertDescription fontSize="sm">
                      {formData.pickupAddressLine1 
                        ? `Selected: ${formData.pickupAddressLine1}, ${formData.pickupCity}`
                        : `Postcode verified: ${formData.pickupPostcode} - ${formData.pickupCity}`
                      }
                    </AlertDescription>
                  </Alert>
                )}

                {/* Address Fields (shown after address selection or manual entry mode) */}
                {(manualAddressEntry || postcodeVerified) && (
                  <VStack spacing={3}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Address Line 1</FormLabel>
                      <Input
                        value={formData.pickupAddressLine1}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, pickupAddressLine1: e.target.value }))
                        }
                        placeholder="House number and street name"
                        size="lg"
                        borderRadius="xl"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Address Line 2 (optional)</FormLabel>
                      <Input
                        value={formData.pickupAddressLine2}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, pickupAddressLine2: e.target.value }))
                        }
                        placeholder="Flat, apartment, building name, etc."
                        size="lg"
                        borderRadius="xl"
                      />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="full">
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">City / Town</FormLabel>
                        <Input
                          value={formData.pickupCity}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, pickupCity: e.target.value }))
                          }
                          placeholder="City or town"
                          size="lg"
                          borderRadius="xl"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Postcode</FormLabel>
                        <Input
                          value={formData.pickupPostcode}
                          isReadOnly
                          size="lg"
                          borderRadius="xl"
                          bg="gray.50"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                )}
              </Box>

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
                  if (
                    !formData.learnerEmail ||
                    !formData.learnerFirstName ||
                    !formData.learnerLastName
                  ) {
                    toast({
                      title: 'Missing information',
                      description: 'Please fill in all required fields',
                      status: 'warning',
                      duration: 3000,
                    });
                    return;
                  }
                  if (!formData.pickupAddressLine1 || !formData.pickupCity || !formData.pickupPostcode) {
                    toast({
                      title: 'Missing pickup address',
                      description: 'Please enter your pickup address including postcode',
                      status: 'warning',
                      duration: 3000,
                    });
                    return;
                  }
                  // Build full pickup location string
                  setFormData((prev) => ({
                    ...prev,
                    pickupLocation: getFullAddress(),
                  }));
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
            <Heading size="sm" mb={6} color="gray.700">
              Review Your Booking
            </Heading>

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
                        {format(parseISO(selectedSlot!.date), 'EEEE, MMMM d, yyyy')}
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        {selectedSlot!.startTime} • {formData.duration} min • {formData.lessonType}{' '}
                        lesson
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
                      <Text>
                        {formData.learnerFirstName} {formData.learnerLastName}
                      </Text>
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
                    {(formData.pickupAddressLine1 || formData.pickupLocation) && (
                      <HStack align="start">
                        <Icon as={MapPin} color="gray.400" mt={1} />
                        <VStack align="start" spacing={0}>
                          {formData.pickupAddressLine1 && <Text>{formData.pickupAddressLine1}</Text>}
                          {formData.pickupAddressLine2 && <Text color="gray.600" fontSize="sm">{formData.pickupAddressLine2}</Text>}
                          <Text color="gray.600" fontSize="sm">
                            {[formData.pickupCity, formData.pickupPostcode].filter(Boolean).join(', ')}
                          </Text>
                        </VStack>
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
                      <Text color="gray.600">
                        {formData.lessonType} lesson ({formData.duration} min)
                      </Text>
                      <Text fontWeight="medium">£{selectedLessonType?.price || 0}</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold" fontSize="lg">
                        Total
                      </Text>
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
                loadingText="Processing..."
                rightIcon={<Lock size={16} />}
              >
                Proceed to Payment
              </Button>
            </HStack>
          </Box>
        )}

        {/* Step 4: Payment */}
        {step === 4 && clientSecret && (
          <Box p={6}>
            <VStack spacing={6} align="stretch">
              <HStack spacing={3}>
                <Circle size="48px" bg="blue.50">
                  <CreditCard size={24} color="#3182CE" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Heading size="md">Complete Payment</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Secure payment powered by Stripe
                  </Text>
                </VStack>
              </HStack>

              {/* Order Summary */}
              <Card bg="gray.50" borderRadius="xl">
                <CardBody py={3}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">
                        {formData.lessonType} lesson • {formData.duration} min
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedSlot && format(parseISO(selectedSlot.date), 'EEE, MMM d')} at {selectedSlot?.startTime}
                      </Text>
                    </VStack>
                    <Text fontWeight="bold" fontSize="xl" color="blue.600">
                      £{selectedLessonType?.price || 0}
                    </Text>
                  </HStack>
                </CardBody>
              </Card>

              {/* Stripe Elements */}
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#3182CE',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <PaymentFormInner
                  price={selectedLessonType?.price || 0}
                  paymentIntentId={paymentIntentId!}
                  onSuccess={() => setStep(5)}
                  onBack={() => {
                    setStep(3);
                    setClientSecret(null);
                  }}
                />
              </Elements>
            </VStack>
          </Box>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <Box p={6}>
            <VStack spacing={6} py={8} textAlign="center">
              <Circle size="80px" bg="green.100" color="green.500">
                <CheckCircle size={40} />
              </Circle>
              <VStack spacing={2}>
                <Heading size="lg" color="gray.800">
                  Booking Confirmed! 🎉
                </Heading>
                <Text color="gray.600" maxW="400px">
                  Your driving lesson has been booked and paid for.
                </Text>
              </VStack>
              
              <Card bg="green.50" borderRadius="xl" w="full">
                <CardBody>
                  <VStack spacing={3}>
                    <HStack justify="space-between" w="full">
                      <Text color="gray.600">Date</Text>
                      <Text fontWeight="medium">
                        {selectedSlot && format(parseISO(selectedSlot.date), 'EEEE, MMMM d, yyyy')}
                      </Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text color="gray.600">Time</Text>
                      <Text fontWeight="medium">{selectedSlot?.startTime}</Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text color="gray.600">Duration</Text>
                      <Text fontWeight="medium">{formData.duration} minutes</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="semibold">Total Paid</Text>
                      <Text fontWeight="bold" color="green.600">
                        £{selectedLessonType?.price || 0}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Alert status="info" borderRadius="xl">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Check your email for booking confirmation and access to your learner portal.
                </AlertDescription>
              </Alert>

              <Button
                colorScheme="blue"
                size="lg"
                borderRadius="xl"
                onClick={() => {
                  setStep(1);
                  setSelectedSlot(null);
                  setSelectedDate(null);
                  setClientSecret(null);
                  setPostcodeVerified(false);
                  setPostcodeError(null);
                  setAddressResults([]);
                  setShowAddressSelect(false);
                  setManualAddressEntry(false);
                  setFormData({
                    date: '',
                    startTime: '',
                    duration: instructor.lessonTypes?.[0]?.duration || 60,
                    lessonType: instructor.lessonTypes?.[0]?.type || 'standard',
                    learnerEmail: '',
                    learnerFirstName: '',
                    learnerLastName: '',
                    learnerPhone: '',
                    pickupLocation: '',
                    notes: '',
                    pickupPostcode: '',
                    pickupAddressLine1: '',
                    pickupAddressLine2: '',
                    pickupCity: '',
                  });
                }}
              >
                Book Another Lesson
              </Button>
            </VStack>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}

// Payment Form Component (inside Stripe Elements)
function PaymentFormInner({
  price,
  paymentIntentId,
  onSuccess,
  onBack,
}: {
  price: number;
  paymentIntentId: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const confirmPaymentMutation = useConfirmBookingPayment();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
      return;
    }

    // Payment succeeded, confirm with backend
    try {
      await confirmPaymentMutation.mutateAsync(paymentIntentId);
      toast({
        title: 'Payment successful!',
        description: 'Your booking has been confirmed.',
        status: 'success',
        duration: 3000,
      });
      onSuccess();
    } catch (err) {
      setError('Payment succeeded but booking confirmation failed. Please contact support.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <PaymentElement />

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <HStack spacing={3} mt={2}>
          <Button
            variant="ghost"
            size="lg"
            onClick={onBack}
            leftIcon={<ChevronLeft size={18} />}
            borderRadius="xl"
            isDisabled={isProcessing}
          >
            Back
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            flex={1}
            borderRadius="xl"
            isLoading={isProcessing || confirmPaymentMutation.isPending}
            loadingText="Processing..."
            isDisabled={!stripe || !elements}
            leftIcon={<Lock size={16} />}
          >
            Pay £{price}
          </Button>
        </HStack>

        <HStack justify="center" spacing={2} opacity={0.6}>
          <Lock size={14} />
          <Text fontSize="xs" color="gray.500">
            Secured by Stripe. Your payment info is encrypted.
          </Text>
        </HStack>
      </VStack>
    </form>
  );
}
