"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
  Avatar,
  Select,
  Spinner,
  Divider,
  Tag,
  Wrap,
  WrapItem,
  useToast,
} from "@chakra-ui/react";
import {
  Search,
  MapPin,
  Star,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useSearchInstructors, useLinkInstructor } from "@/hooks";
import { useLearnerAuth } from "@/lib/auth";
import type { SearchFilters } from "@/hooks/useSearch";

export default function SearchPage() {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated, isLoading: authLoading } = useLearnerAuth();
  const linkInstructor = useLinkInstructor();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Search state
  const [postcode, setPostcode] = useState("");
  const [submittedPostcode, setSubmittedPostcode] = useState("");
  const [radius, setRadius] = useState(10);
  const [transmission, setTransmission] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortBy, setSortBy] = useState("distance");
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  // Track which instructors we've linked (optimistic)
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set());

  const filters: SearchFilters = useMemo(
    () => ({
      postcode: submittedPostcode || undefined,
      radius,
      transmission: transmission || undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      page,
      limit: 12,
    }),
    [submittedPostcode, radius, transmission, maxPrice, sortBy, page],
  );

  const {
    data: searchData,
    isLoading,
    isFetching,
    error,
  } = useSearchInstructors(filters, hasSearched && !!submittedPostcode);

  const instructors = searchData?.instructors || [];
  const pagination = searchData?.pagination;

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!postcode.trim()) {
        toast({
          title: "Enter a postcode",
          description: "Please enter your postcode to find nearby instructors.",
          status: "warning",
          duration: 3000,
        });
        return;
      }
      setSubmittedPostcode(postcode.trim().toUpperCase());
      setPage(1);
      setHasSearched(true);
    },
    [postcode, toast],
  );

  const handleLink = useCallback(
    async (instructorId: string) => {
      try {
        await linkInstructor.mutateAsync(instructorId);
        setLinkedIds((prev) => new Set(prev).add(instructorId));
      } catch {
        // Error toast handled by the hook
      }
    },
    [linkInstructor],
  );

  const handleLinkAndBook = useCallback(
    async (instructorId: string) => {
      try {
        await linkInstructor.mutateAsync(instructorId);
        setLinkedIds((prev) => new Set(prev).add(instructorId));
        router.push("/book");
      } catch {
        // Error toast handled by the hook
      }
    },
    [linkInstructor, router],
  );

  if (authLoading || !isAuthenticated) {
    return (
      <Box minH="100vh" bg="bg.subtle" p={8}>
        <Skeleton height="400px" />
      </Box>
    );
  }

  return (
    <Box maxW="900px" mx="auto" p={6}>
      {/* Header */}
      <HStack mb={6}>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => router.push("/book")}
        >
          Back to Booking
        </Button>
      </HStack>

      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg" mb={1}>
            Find an Instructor
          </Heading>
          <Text color="gray.500">
            Search for driving instructors near you and link them to your
            account.
          </Text>
        </Box>

        {/* Search Form */}
        <Card>
          <CardBody>
            <form onSubmit={handleSearch}>
              <VStack spacing={4}>
                <HStack w="full" spacing={4} flexWrap="wrap">
                  <FormControl flex="1" minW="200px">
                    <FormLabel fontSize="sm">Postcode</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <MapPin size={16} color="gray" />
                      </InputLeftElement>
                      <Input
                        placeholder="e.g. SW1A 1AA"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl w="120px" flexShrink={0}>
                    <FormLabel fontSize="sm">Radius</FormLabel>
                    <Select
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                    >
                      <option value={5}>5 miles</option>
                      <option value={10}>10 miles</option>
                      <option value={15}>15 miles</option>
                      <option value={25}>25 miles</option>
                      <option value={50}>50 miles</option>
                    </Select>
                  </FormControl>

                  <FormControl w="150px" flexShrink={0}>
                    <FormLabel fontSize="sm">Transmission</FormLabel>
                    <Select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                    >
                      <option value="">Any</option>
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                    </Select>
                  </FormControl>

                  <FormControl w="130px" flexShrink={0}>
                    <FormLabel fontSize="sm">Max Price</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <DollarSign size={16} color="gray" />
                      </InputLeftElement>
                      <Input
                        type="number"
                        placeholder="Any"
                        value={maxPrice}
                        onChange={(e) =>
                          setMaxPrice(
                            e.target.value ? Number(e.target.value) : "",
                          )
                        }
                      />
                    </InputGroup>
                  </FormControl>
                </HStack>

                <HStack w="full" justify="space-between">
                  <FormControl w="160px">
                    <FormLabel fontSize="sm">Sort by</FormLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="distance">Distance</option>
                      <option value="price_low">Price (Low–High)</option>
                      <option value="price_high">Price (High–Low)</option>
                      <option value="rating">Rating</option>
                    </Select>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    leftIcon={<Search size={16} />}
                    isLoading={isFetching}
                    alignSelf="flex-end"
                  >
                    Search
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>

        {/* Results */}
        {!hasSearched && (
          <Box textAlign="center" py={12}>
            <Search size={48} color="gray" style={{ marginBottom: '16px' }} />
            <Heading size="md" color="gray.400">
              Enter your postcode to get started
            </Heading>
          </Box>
        )}

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              {(error as any)?.response?.data?.message ||
                "Failed to search. Please check the postcode and try again."}
            </AlertDescription>
          </Alert>
        )}

        {isLoading && hasSearched && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="200px" borderRadius="lg" />
            ))}
          </SimpleGrid>
        )}

        {hasSearched && !isLoading && instructors.length === 0 && !error && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              No instructors found near {submittedPostcode}. Try expanding your
              search radius or changing filters.
            </AlertDescription>
          </Alert>
        )}

        {instructors.length > 0 && (
          <>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">
                {pagination?.total || instructors.length} instructor
                {(pagination?.total || instructors.length) !== 1 ? "s" : ""}{" "}
                found
                {submittedPostcode ? ` near ${submittedPostcode}` : ""}
              </Text>
              {isFetching && <Spinner size="sm" />}
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {instructors.map((instructor: any) => (
                <InstructorCard
                  key={instructor._id}
                  instructor={instructor}
                  isLinked={linkedIds.has(instructor._id)}
                  isLinking={
                    linkInstructor.isPending &&
                    linkInstructor.variables === instructor._id
                  }
                  onLink={() => handleLink(instructor._id)}
                  onLinkAndBook={() => handleLinkAndBook(instructor._id)}
                  onGoToBooking={() => router.push("/book")}
                />
              ))}
            </SimpleGrid>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <HStack justify="center" pt={4}>
                <Button
                  size="sm"
                  leftIcon={<ChevronLeft size={16} />}
                  isDisabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Text fontSize="sm" color="gray.500">
                  Page {pagination.page} of {pagination.totalPages}
                </Text>
                <Button
                  size="sm"
                  rightIcon={<ChevronRight size={16} />}
                  isDisabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </HStack>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
}

// ---------- Instructor Card ----------

function InstructorCard({
  instructor,
  isLinked,
  isLinking,
  onLink,
  onLinkAndBook,
  onGoToBooking,
}: {
  instructor: any;
  isLinked: boolean;
  isLinking: boolean;
  onLink: () => void;
  onLinkAndBook: () => void;
  onGoToBooking: () => void;
}) {
  const name = `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim();
  const rate = instructor.hourlyRate;
  const transmission = instructor.vehicleInfo?.transmission;
  const distance = instructor.distance;
  const rating = instructor.averageRating || instructor.rating;
  const reviewCount = instructor.totalReviews || instructor.reviewCount || 0;
  const languages = instructor.languages || [];
  const experience = instructor.yearsExperience;

  return (
    <Card variant="outline" _hover={{ shadow: "md" }} transition="shadow 0.2s">
      <CardBody>
        <VStack align="stretch" spacing={3}>
          {/* Top: Avatar + Name + Distance */}
          <HStack spacing={3}>
            <Avatar
              size="md"
              name={name}
              src={instructor.profileImage}
            />
            <Box flex="1">
              <Text fontWeight="bold" fontSize="md">
                {name}
              </Text>
              {distance != null && (
                <HStack spacing={1} fontSize="xs" color="gray.500">
                  <MapPin size={12} />
                  <Text>{distance.toFixed(1)} miles away</Text>
                </HStack>
              )}
            </Box>
            {rate != null && (
              <Badge colorScheme="green" fontSize="md" px={2} py={1}>
                £{rate}/hr
              </Badge>
            )}
          </HStack>

          <Divider />

          {/* Details */}
          <Wrap spacing={2}>
            {transmission && (
              <WrapItem>
                <Tag size="sm" colorScheme="purple">
                  {transmission.charAt(0).toUpperCase() +
                    transmission.slice(1)}
                </Tag>
              </WrapItem>
            )}
            {rating != null && (
              <WrapItem>
                <Tag size="sm" colorScheme="yellow">
                  <Star size={12} style={{ marginRight: '4px' }} /> {rating.toFixed(1)}
                  {reviewCount > 0 && ` (${reviewCount})`}
                </Tag>
              </WrapItem>
            )}
            {experience != null && (
              <WrapItem>
                <Tag size="sm" colorScheme="blue">
                  <Clock size={12} style={{ marginRight: '4px' }} /> {experience} yrs
                </Tag>
              </WrapItem>
            )}
            {languages.length > 0 && (
              <WrapItem>
                <Tag size="sm" colorScheme="gray">
                  {languages.join(", ")}
                </Tag>
              </WrapItem>
            )}
          </Wrap>

          {instructor.bio && (
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {instructor.bio}
            </Text>
          )}

          {/* Actions */}
          <HStack spacing={2} pt={1}>
            {isLinked ? (
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<Check size={16} />}
                variant="outline"
                isDisabled
                flex="1"
              >
                Linked
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={onLink}
                isLoading={isLinking}
                flex="1"
              >
                Link
              </Button>
            )}
            <Button
              size="sm"
              colorScheme="blue"
              onClick={isLinked ? onGoToBooking : onLinkAndBook}
              isLoading={isLinking}
              flex="1"
            >
              {isLinked ? "Go to Booking" : "Link & Book"}
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}
