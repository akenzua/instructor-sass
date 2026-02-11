'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Skeleton,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
  useDisclosure,
  VStack,
  Avatar,
  Badge,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import {
  Search,
  MapPin,
  Car,
  SlidersHorizontal,
  GraduationCap,
  Award,
  Users,
  Clock,
  ChevronRight,
  Shield,
  Percent,
  CarFront,
  BookOpen,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useSearchInstructors,
  type SearchInstructorsParams,
  type SearchInstructor,
} from '@/lib/api';

const TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'both', label: 'Both' },
];

const RADIUS_OPTIONS = [
  { value: 5, label: '5 miles' },
  { value: 10, label: '10 miles' },
  { value: 15, label: '15 miles' },
  { value: 25, label: '25 miles' },
  { value: 50, label: '50 miles' },
];

const SORT_OPTIONS = [
  { value: 'distance-asc', label: 'Nearest First' },
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'experience-desc', label: 'Most Experienced' },
  { value: 'passRate-desc', label: 'Highest Pass Rate' },
];

const SPECIALIZATION_OPTIONS = [
  'Nervous drivers',
  'Test preparation',
  'Motorway lessons',
  'Refresher courses',
  'Intensive courses',
  'Automatic only',
  'Manual only',
];

// Sponsored ads data
const LEARNER_ADS = [
  {
    id: 'insurance-1',
    type: 'insurance',
    title: 'Learner Driver Insurance',
    description: 'Get covered from just £3.99/day. Practice in any car with full protection.',
    cta: 'Get Quote',
    icon: Shield,
    color: 'blue',
    bgGradient: 'linear(to-br, blue.500, blue.600)',
    link: '#',
    badge: 'Most Popular',
  },
  {
    id: 'car-1',
    type: 'car',
    title: 'First Car Deals',
    description: 'Up to £1,000 off your first car with our partner dealerships.',
    cta: 'Browse Cars',
    icon: CarFront,
    color: 'green',
    bgGradient: 'linear(to-br, green.500, green.600)',
    link: '#',
    badge: 'Exclusive',
  },
  {
    id: 'theory-1',
    type: 'theory',
    title: 'Pass Your Theory First Time',
    description: 'Official DVSA practice tests and hazard perception training.',
    cta: 'Start Free Trial',
    icon: BookOpen,
    color: 'purple',
    bgGradient: 'linear(to-br, purple.500, purple.600)',
    link: '#',
    badge: '94% Pass Rate',
  },
  {
    id: 'insurance-2',
    type: 'insurance',
    title: 'Black Box Insurance',
    description: 'Save up to 40% on your insurance with safe driving rewards.',
    cta: 'Learn More',
    icon: Percent,
    color: 'orange',
    bgGradient: 'linear(to-br, orange.400, orange.500)',
    link: '#',
    badge: 'Save 40%',
  },
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterDrawer = useDisclosure();

  // Parse initial filters from URL
  const [filters, setFilters] = useState<SearchInstructorsParams>(() => ({
    query: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    radius: searchParams.get('radius') ? Number(searchParams.get('radius')) : 10,
    transmission:
      (searchParams.get('transmission') as 'manual' | 'automatic' | 'both') || undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minPassRate: searchParams.get('minPassRate')
      ? Number(searchParams.get('minPassRate'))
      : undefined,
    minExperience: searchParams.get('minExperience')
      ? Number(searchParams.get('minExperience'))
      : undefined,
    acceptingStudents: searchParams.get('acceptingStudents') === 'true',
    specializations: searchParams.get('specializations') || undefined,
    sortBy: (searchParams.get('sortBy') as SearchInstructorsParams['sortBy']) || 'rating',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    page: 1,
    limit: 12,
  }));

  const [searchQuery, setSearchQuery] = useState(filters.query || '');
  const [locationQuery, setLocationQuery] = useState(filters.location || '');
  const [priceRange, setPriceRange] = useState(filters.maxPrice || 100);
  const [passRateRange, setPassRateRange] = useState(filters.minPassRate || 0);
  const [experienceRange, setExperienceRange] = useState(filters.minExperience || 0);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Fetch instructors
  const { data, isLoading, error } = useSearchInstructors(filters);

  // Get user's current location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newFilters = {
          ...filters,
          lat: latitude,
          lng: longitude,
          location: undefined, // Clear text location when using coordinates
          sortBy: 'distance' as const,
          sortOrder: 'asc' as const,
          page: 1,
        };
        setFilters(newFilters);
        setLocationQuery('📍 Current location');
        updateURL(newFilters);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please enter a postcode instead.');
        setIsGettingLocation(false);
      }
    );
  };

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: SearchInstructorsParams) => {
      const params = new URLSearchParams();
      if (newFilters.query) params.set('q', newFilters.query);
      if (newFilters.location) params.set('location', newFilters.location);
      if (newFilters.radius && newFilters.radius !== 10) params.set('radius', String(newFilters.radius));
      if (newFilters.lat) params.set('lat', String(newFilters.lat));
      if (newFilters.lng) params.set('lng', String(newFilters.lng));
      if (newFilters.transmission) params.set('transmission', newFilters.transmission);
      if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice));
      if (newFilters.minPassRate) params.set('minPassRate', String(newFilters.minPassRate));
      if (newFilters.minExperience) params.set('minExperience', String(newFilters.minExperience));
      if (newFilters.acceptingStudents) params.set('acceptingStudents', 'true');
      if (newFilters.specializations) params.set('specializations', newFilters.specializations);
      if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
      if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder);
      router.push(`/search?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  // Handle search submit
  const handleSearch = () => {
    // Clear lat/lng if user typed a location (we'll geocode on server)
    const newFilters = { 
      ...filters, 
      query: searchQuery, 
      location: locationQuery !== '📍 Current location' ? locationQuery : undefined,
      lat: locationQuery !== '📍 Current location' ? undefined : filters.lat,
      lng: locationQuery !== '📍 Current location' ? undefined : filters.lng,
      page: 1 
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchInstructorsParams, value: unknown) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [
      SearchInstructorsParams['sortBy'],
      'asc' | 'desc',
    ];
    const newFilters = { ...filters, sortBy, sortOrder, page: 1 };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const newFilters: SearchInstructorsParams = {
      query: '',
      page: 1,
      limit: 12,
      radius: 10,
      sortBy: 'rating',
      sortOrder: 'desc',
    };
    setFilters(newFilters);
    setSearchQuery('');
    setLocationQuery('');
    setPriceRange(100);
    setPassRateRange(0);
    setExperienceRange(0);
    router.push('/search');
  };

  // Remove individual filter
  const removeFilter = (key: keyof SearchInstructorsParams) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    if (key === 'location') {
      setLocationQuery('');
      delete newFilters['lat'];
      delete newFilters['lng'];
    }
    if (key === 'maxPrice') setPriceRange(100);
    if (key === 'minPassRate') setPassRateRange(0);
    if (key === 'minExperience') setExperienceRange(0);
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Active filters for display
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value && !['page', 'limit', 'sortBy', 'sortOrder', 'query', 'lat', 'lng', 'radius'].includes(key)
  );

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Search Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" py={6}>
        <Container maxW="container.xl">
          <VStack spacing={4} align="stretch">
            <Heading size="lg">Find a Driving Instructor</Heading>

            {/* Search Bar */}
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              {/* Name search */}
              <InputGroup size="lg" flex={1}>
                <InputLeftElement pointerEvents="none">
                  <Search size={20} color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="Instructor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  bg="white"
                />
              </InputGroup>

              {/* Location search */}
              <InputGroup size="lg" flex={1}>
                <InputLeftElement pointerEvents="none">
                  <MapPin size={20} color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="Postcode or area (e.g., SW1A, Manchester)"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  bg="white"
                />
              </InputGroup>

              {/* Radius select */}
              <Select
                size="lg"
                value={filters.radius || 10}
                onChange={(e) => handleFilterChange('radius', Number(e.target.value))}
                w={{ base: 'full', md: '150px' }}
                bg="white"
              >
                {RADIUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <HStack spacing={2}>
                <Button 
                  colorScheme="primary" 
                  size="lg" 
                  onClick={handleSearch} 
                  px={8}
                  minW="100px"
                >
                  Search
                </Button>
                <IconButton
                  aria-label="Use my location"
                  icon={<Navigation size={20} />}
                  size="lg"
                  variant="outline"
                  onClick={handleUseMyLocation}
                  isLoading={isGettingLocation}
                  title="Use my current location"
                />
                <IconButton
                  aria-label="Filters"
                  icon={<SlidersHorizontal size={20} />}
                  size="lg"
                  variant="outline"
                  onClick={filterDrawer.onOpen}
                  display={{ base: 'flex', lg: 'none' }}
                />
              </HStack>
            </Stack>

            {/* Search info banner */}
            {data?.search?.type === 'geo' && (
              <HStack 
                bg="blue.50" 
                p={3} 
                borderRadius="md" 
                spacing={2}
              >
                <Icon as={MapPin} color="blue.500" />
                <Text fontSize="sm" color="blue.700">
                  Showing instructors within {data.search.radiusMiles} miles of{' '}
                  <strong>{data.search.location}</strong>
                </Text>
              </HStack>
            )}

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <HStack spacing={2} flexWrap="wrap">
                <Text fontSize="sm" color="gray.600">
                  Active filters:
                </Text>
                {activeFilters.map(([key, value]) => (
                  <Tag key={key} size="sm" colorScheme="primary" borderRadius="full">
                    <TagLabel>
                      {key === 'transmission' && `${value}`}
                      {key === 'maxPrice' && `Max £${value}/hr`}
                      {key === 'minPassRate' && `Pass rate ≥${value}%`}
                      {key === 'minExperience' && `${value}+ years exp`}
                      {key === 'acceptingStudents' && 'Accepting students'}
                      {key === 'location' && `Near ${value}`}
                      {key === 'specializations' && `${value}`}
                    </TagLabel>
                    <TagCloseButton
                      onClick={() => removeFilter(key as keyof SearchInstructorsParams)}
                    />
                  </Tag>
                ))}
                <Button size="xs" variant="ghost" onClick={clearFilters}>
                  Clear all
                </Button>
              </HStack>
            )}
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={6}>
        <Grid templateColumns={{ base: '1fr', lg: '280px 1fr' }} gap={6}>
          {/* Desktop Filters Sidebar */}
          <GridItem display={{ base: 'none', lg: 'block' }}>
            <VStack spacing={6} align="stretch">
              <FiltersSidebar
                filters={filters}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                passRateRange={passRateRange}
                setPassRateRange={setPassRateRange}
                experienceRange={experienceRange}
                setExperienceRange={setExperienceRange}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
              {/* Sidebar Ads */}
              <LearnerAdsSection variant="sidebar" />
            </VStack>
          </GridItem>

          {/* Results */}
          <GridItem>
            {/* Results Header */}
            <Flex justify="space-between" align="center" mb={4}>
              <Text color="gray.600">{data?.pagination.total ?? 0} instructors found</Text>
              <Select
                size="sm"
                w="200px"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Flex>

            {/* Results Grid */}
            {isLoading ? (
              <VStack spacing={4}>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} height="200px" width="100%" borderRadius="lg" />
                ))}
              </VStack>
            ) : error ? (
              <Box textAlign="center" py={12}>
                <Text color="red.500">Error loading instructors. Please try again.</Text>
              </Box>
            ) : data?.instructors.length === 0 ? (
              <Box textAlign="center" py={12}>
                <VStack spacing={4}>
                  <Icon as={Search} boxSize={12} color="gray.400" />
                  <Heading size="md" color="gray.600">
                    No instructors found
                  </Heading>
                  <Text color="gray.500">Try adjusting your search or filters</Text>
                  <Button onClick={clearFilters} colorScheme="primary" variant="outline">
                    Clear all filters
                  </Button>
                </VStack>
              </Box>
            ) : (
              <>
                <VStack spacing={4} align="stretch">
                  {data?.instructors.map((instructor) => (
                    <InstructorCard key={instructor._id} instructor={instructor} />
                  ))}
                </VStack>

                {/* Pagination */}
                {data && data.pagination.totalPages > 1 && (
                  <Flex justify="center" mt={8}>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        isDisabled={data.pagination.page === 1}
                        onClick={() => handlePageChange(data.pagination.page - 1)}
                      >
                        Previous
                      </Button>
                      {[...Array(data.pagination.totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          size="sm"
                          variant={data.pagination.page === i + 1 ? 'solid' : 'outline'}
                          colorScheme={data.pagination.page === i + 1 ? 'primary' : 'gray'}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        size="sm"
                        isDisabled={data.pagination.page === data.pagination.totalPages}
                        onClick={() => handlePageChange(data.pagination.page + 1)}
                      >
                        Next
                      </Button>
                    </HStack>
                  </Flex>
                )}

                {/* Ads Section - After Results */}
                <LearnerAdsSection variant="horizontal" />
              </>
            )}
          </GridItem>
        </Grid>
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer
        isOpen={filterDrawer.isOpen}
        placement="right"
        onClose={filterDrawer.onClose}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Filters</DrawerHeader>
          <DrawerBody py={4}>
            <FiltersSidebar
              filters={filters}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              passRateRange={passRateRange}
              setPassRateRange={setPassRateRange}
              experienceRange={experienceRange}
              setExperienceRange={setExperienceRange}
              onFilterChange={(key, value) => {
                handleFilterChange(key, value);
                filterDrawer.onClose();
              }}
              onClearFilters={() => {
                clearFilters();
                filterDrawer.onClose();
              }}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

// Filters Sidebar Component
interface FiltersSidebarProps {
  filters: SearchInstructorsParams;
  priceRange: number;
  setPriceRange: (value: number) => void;
  passRateRange: number;
  setPassRateRange: (value: number) => void;
  experienceRange: number;
  setExperienceRange: (value: number) => void;
  onFilterChange: (key: keyof SearchInstructorsParams, value: unknown) => void;
  onClearFilters: () => void;
}

function FiltersSidebar({
  filters,
  priceRange,
  setPriceRange,
  passRateRange,
  setPassRateRange,
  experienceRange,
  setExperienceRange,
  onFilterChange,
  onClearFilters,
}: FiltersSidebarProps) {
  return (
    <Card bg="white" position="sticky" top={4}>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="sm">Filters</Heading>
            <Button size="xs" variant="ghost" onClick={onClearFilters}>
              Clear all
            </Button>
          </Flex>

          {/* Location */}
          <Box>
            <Text fontWeight="medium" mb={2}>
              Location
            </Text>
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <MapPin size={14} color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Area or postcode"
                value={filters.location || ''}
                onChange={(e) => onFilterChange('location', e.target.value || undefined)}
              />
            </InputGroup>
          </Box>

          {/* Transmission */}
          <Box>
            <Text fontWeight="medium" mb={2}>
              Transmission
            </Text>
            <Stack spacing={2}>
              {TRANSMISSION_OPTIONS.map((option) => (
                <Checkbox
                  key={option.value}
                  isChecked={filters.transmission === option.value}
                  onChange={(e) =>
                    onFilterChange('transmission', e.target.checked ? option.value : undefined)
                  }
                >
                  {option.label}
                </Checkbox>
              ))}
            </Stack>
          </Box>

          {/* Max Price */}
          <Box>
            <Text fontWeight="medium" mb={4}>
              Max Price per Hour: £{priceRange}
            </Text>
            <Slider
              value={priceRange}
              min={20}
              max={100}
              step={5}
              onChange={setPriceRange}
              onChangeEnd={(value) => onFilterChange('maxPrice', value < 100 ? value : undefined)}
            >
              <SliderMark value={20} mt={2} fontSize="xs">
                £20
              </SliderMark>
              <SliderMark value={60} mt={2} fontSize="xs">
                £60
              </SliderMark>
              <SliderMark value={100} mt={2} fontSize="xs">
                £100+
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack bg="primary.500" />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>

          {/* Minimum Pass Rate */}
          <Box>
            <Text fontWeight="medium" mb={4}>
              Min Pass Rate: {passRateRange}%
            </Text>
            <Slider
              value={passRateRange}
              min={0}
              max={100}
              step={5}
              onChange={setPassRateRange}
              onChangeEnd={(value) => onFilterChange('minPassRate', value > 0 ? value : undefined)}
            >
              <SliderMark value={0} mt={2} fontSize="xs">
                0%
              </SliderMark>
              <SliderMark value={50} mt={2} fontSize="xs">
                50%
              </SliderMark>
              <SliderMark value={100} mt={2} fontSize="xs">
                100%
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack bg="primary.500" />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>

          {/* Minimum Experience */}
          <Box>
            <Text fontWeight="medium" mb={4}>
              Min Experience: {experienceRange} years
            </Text>
            <Slider
              value={experienceRange}
              min={0}
              max={20}
              step={1}
              onChange={setExperienceRange}
              onChangeEnd={(value) =>
                onFilterChange('minExperience', value > 0 ? value : undefined)
              }
            >
              <SliderMark value={0} mt={2} fontSize="xs">
                0
              </SliderMark>
              <SliderMark value={10} mt={2} fontSize="xs">
                10
              </SliderMark>
              <SliderMark value={20} mt={2} fontSize="xs">
                20+
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack bg="primary.500" />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>

          {/* Accepting Students */}
          <Checkbox
            isChecked={filters.acceptingStudents}
            onChange={(e) => onFilterChange('acceptingStudents', e.target.checked || undefined)}
          >
            Only accepting new students
          </Checkbox>

          {/* Specializations */}
          <Box>
            <Text fontWeight="medium" mb={2}>
              Specializations
            </Text>
            <Wrap spacing={2}>
              {SPECIALIZATION_OPTIONS.map((spec) => {
                const isSelected = filters.specializations?.includes(spec);
                return (
                  <WrapItem key={spec}>
                    <Tag
                      size="sm"
                      variant={isSelected ? 'solid' : 'outline'}
                      colorScheme={isSelected ? 'primary' : 'gray'}
                      cursor="pointer"
                      onClick={() => {
                        const current = filters.specializations?.split(',').filter(Boolean) || [];
                        const updated = isSelected
                          ? current.filter((s) => s !== spec)
                          : [...current, spec];
                        onFilterChange(
                          'specializations',
                          updated.length > 0 ? updated.join(',') : undefined
                        );
                      }}
                    >
                      {spec}
                    </Tag>
                  </WrapItem>
                );
              })}
            </Wrap>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}

// Instructor Card Component - Horizontal Layout
function InstructorCard({ instructor }: { instructor: SearchInstructor }) {
  const fullName = `${instructor.firstName} ${instructor.lastName}`;
  const displayName = instructor.businessName || fullName;
  const location = instructor.serviceAreas?.[0] || 'Location not specified';
  const transmission = instructor.vehicleInfo?.transmission || 'manual';

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Card
      as={Link}
      href={`/instructor/${instructor.username}`}
      bg="white"
      overflow="hidden"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      cursor="pointer"
    >
      <CardBody p={{ base: 4, md: 6 }}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 4, md: 6 }}>
          {/* Left: Avatar and Quick Info */}
          <Flex
            direction={{ base: 'row', md: 'column' }}
            align="center"
            gap={4}
            minW={{ md: '140px' }}
          >
            <Box position="relative">
              <Avatar
                size={{ base: 'xl', md: '2xl' }}
                name={fullName}
                src={instructor.profileImage}
              />
              {/* Distance badge */}
              {instructor.distance !== undefined && (
                <Badge
                  position="absolute"
                  bottom={-1}
                  left="50%"
                  transform="translateX(-50%)"
                  colorScheme="blue"
                  fontSize="xs"
                  px={2}
                  borderRadius="full"
                >
                  {instructor.distance} mi
                </Badge>
              )}
            </Box>
            <VStack spacing={1} display={{ base: 'flex', md: 'none' }} align="start" flex={1}>
              <Heading size="md" noOfLines={1}>
                {displayName}
              </Heading>
              <HStack spacing={1} color="gray.600" fontSize="sm">
                <MapPin size={14} />
                <Text noOfLines={1}>{location}</Text>
                {instructor.distance !== undefined && (
                  <Text color="blue.500" fontWeight="medium">
                    ({instructor.distance} mi)
                  </Text>
                )}
              </HStack>
            </VStack>
          </Flex>

          {/* Middle: Main Info */}
          <VStack flex={1} align="stretch" spacing={3}>
            {/* Name and Location - Desktop */}
            <Box display={{ base: 'none', md: 'block' }}>
              <Heading size="md" noOfLines={1}>
                {displayName}
              </Heading>
              <HStack spacing={1} color="gray.600" fontSize="sm" mt={1}>
                <MapPin size={14} />
                <Text noOfLines={1}>{location}</Text>
                {instructor.distance !== undefined && (
                  <Badge colorScheme="blue" ml={2}>
                    {instructor.distance} miles away
                  </Badge>
                )}
              </HStack>
            </Box>

            {/* Bio */}
            {instructor.bio && (
              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                {instructor.bio}
              </Text>
            )}

            {/* Stats Row */}
            <HStack spacing={6} flexWrap="wrap">
              {instructor.passRate !== undefined && (
                <HStack spacing={1}>
                  <Icon as={Award} boxSize={4} color="green.500" />
                  <Text fontWeight="bold" color="green.600">
                    {instructor.passRate}%
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    pass rate
                  </Text>
                </HStack>
              )}
              {instructor.yearsExperience !== undefined && (
                <HStack spacing={1}>
                  <Icon as={Clock} boxSize={4} color="blue.500" />
                  <Text fontWeight="bold" color="blue.600">
                    {instructor.yearsExperience}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    years exp
                  </Text>
                </HStack>
              )}
              {instructor.stats?.totalStudents !== undefined &&
                instructor.stats.totalStudents > 0 && (
                  <HStack spacing={1}>
                    <Icon as={Users} boxSize={4} color="purple.500" />
                    <Text fontWeight="bold" color="purple.600">
                      {instructor.stats.totalStudents}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      students
                    </Text>
                  </HStack>
                )}
              {instructor.totalStudentsTaught !== undefined &&
                instructor.totalStudentsTaught > 0 &&
                !instructor.stats?.totalStudents && (
                  <HStack spacing={1}>
                    <Icon as={Users} boxSize={4} color="purple.500" />
                    <Text fontWeight="bold" color="purple.600">
                      {instructor.totalStudentsTaught}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      students taught
                    </Text>
                  </HStack>
                )}
            </HStack>

            {/* Badges */}
            <Wrap spacing={2}>
              <WrapItem>
                <Badge colorScheme="blue" fontSize="xs" px={2} py={1}>
                  <HStack spacing={1}>
                    <Car size={12} />
                    <Text>
                      {transmission === 'automatic'
                        ? 'Automatic'
                        : transmission === 'both'
                          ? 'Manual & Auto'
                          : 'Manual'}
                    </Text>
                  </HStack>
                </Badge>
              </WrapItem>
              {instructor.acceptingNewStudents && (
                <WrapItem>
                  <Badge colorScheme="green" fontSize="xs" px={2} py={1}>
                    Accepting Students
                  </Badge>
                </WrapItem>
              )}
              {instructor.qualifications?.slice(0, 2).map((qual, i) => (
                <WrapItem key={i}>
                  <Badge colorScheme="purple" fontSize="xs" px={2} py={1}>
                    <HStack spacing={1}>
                      <GraduationCap size={12} />
                      <Text>{qual}</Text>
                    </HStack>
                  </Badge>
                </WrapItem>
              ))}
              {instructor.specializations?.slice(0, 2).map((spec, i) => (
                <WrapItem key={i}>
                  <Badge colorScheme="orange" fontSize="xs" px={2} py={1}>
                    {spec}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>

            {/* Languages */}
            {instructor.languages && instructor.languages.length > 1 && (
              <Text fontSize="xs" color="gray.500">
                Languages: {instructor.languages.join(', ')}
              </Text>
            )}
          </VStack>

          {/* Right: Price and CTA */}
          <VStack
            justify="space-between"
            align={{ base: 'stretch', md: 'flex-end' }}
            minW={{ md: '160px' }}
            pt={{ base: 3, md: 0 }}
            borderTop={{ base: '1px solid', md: 'none' }}
            borderColor="gray.100"
          >
            <VStack align={{ base: 'flex-start', md: 'flex-end' }} spacing={0}>
              <Text fontSize="xs" color="gray.500">
                From
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="primary.600">
                {formatCurrency(instructor.hourlyRate || 45)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                per hour
              </Text>
            </VStack>
            <Button
              colorScheme="primary"
              size={{ base: 'md', md: 'lg' }}
              rightIcon={<ChevronRight size={16} />}
              w={{ base: 'full', md: 'auto' }}
            >
              View Profile
            </Button>
          </VStack>
        </Flex>
      </CardBody>
    </Card>
  );
}

// Learner Ads Section Component
interface LearnerAdsSectionProps {
  variant?: 'horizontal' | 'sidebar';
}

function LearnerAdsSection({ variant = 'horizontal' }: LearnerAdsSectionProps) {
  if (variant === 'sidebar') {
    // Sidebar variant - stacked vertically
    return (
      <VStack spacing={4} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="sm" color="gray.600">
            Sponsored
          </Heading>
        </Flex>
        {LEARNER_ADS.slice(0, 2).map((ad) => (
          <SidebarAdCard key={ad.id} ad={ad} />
        ))}
      </VStack>
    );
  }

  // Horizontal variant - full width cards
  return (
    <Box mt={10} mb={6}>
      <Flex justify="space-between" align="center" mb={4}>
        <VStack align="start" spacing={0}>
          <Heading size="md">Helpful Resources for Learners</Heading>
          <Text fontSize="sm" color="gray.500">
            Exclusive deals from our trusted partners
          </Text>
        </VStack>
        <Badge colorScheme="gray" fontSize="xs">
          Sponsored
        </Badge>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {LEARNER_ADS.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </SimpleGrid>
    </Box>
  );
}

// Individual Ad Card Component
interface AdCardProps {
  ad: (typeof LEARNER_ADS)[number];
}

function AdCard({ ad }: AdCardProps) {
  const IconComponent = ad.icon;

  return (
    <Card
      as="a"
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer"
      overflow="hidden"
      _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
      transition="all 0.2s"
      cursor="pointer"
      position="relative"
    >
      {/* Gradient Header */}
      <Box bgGradient={ad.bgGradient} py={6} px={4} position="relative">
        {ad.badge && (
          <Badge
            position="absolute"
            top={2}
            right={2}
            colorScheme="whiteAlpha"
            bg="whiteAlpha.300"
            color="white"
            fontSize="xs"
          >
            {ad.badge}
          </Badge>
        )}
        <Flex justify="center">
          <Box
            bg="whiteAlpha.200"
            p={3}
            borderRadius="full"
            backdropFilter="blur(10px)"
          >
            <Icon as={IconComponent} boxSize={8} color="white" />
          </Box>
        </Flex>
      </Box>

      <CardBody>
        <VStack spacing={3} align="stretch">
          <Heading size="sm" noOfLines={1}>
            {ad.title}
          </Heading>
          <Text fontSize="sm" color="gray.600" noOfLines={2} minH="40px">
            {ad.description}
          </Text>
          <Button
            colorScheme={ad.color}
            size="sm"
            rightIcon={<ExternalLink size={14} />}
            w="full"
          >
            {ad.cta}
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}

// Sidebar Ad Card - Compact version
function SidebarAdCard({ ad }: AdCardProps) {
  const IconComponent = ad.icon;

  return (
    <Card
      as="a"
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer"
      overflow="hidden"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
      cursor="pointer"
      size="sm"
    >
      <CardBody p={3}>
        <HStack spacing={3}>
          <Box
            bgGradient={ad.bgGradient}
            p={2}
            borderRadius="md"
            flexShrink={0}
          >
            <Icon as={IconComponent} boxSize={5} color="white" />
          </Box>
          <VStack align="start" spacing={0} flex={1}>
            <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
              {ad.title}
            </Text>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {ad.description}
            </Text>
          </VStack>
        </HStack>
        {ad.badge && (
          <Badge colorScheme={ad.color} fontSize="xs" mt={2}>
            {ad.badge}
          </Badge>
        )}
      </CardBody>
    </Card>
  );
}
