'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Tag,
  Text,
  VStack,
  Badge,
  Avatar,
  useDisclosure,
  Circle,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import {
  Car,
  CheckCircle,
  MapPin,
  Star,
  Trophy,
  Award,
  Shield,
  GraduationCap,
  ChevronRight,
  Sparkles,
  Search,
  ArrowLeft,
  CarFront,
  BookOpen,
  Percent,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PublicInstructor, DayAvailability, PublicReview } from '@/lib/api';
import type { Package } from '@acme/shared';
import { InlineBookingSection } from './InlineBookingSection';
import { PackagePurchaseModal } from './PackagePurchaseModal';
import { ShareButton } from './ShareButton';

interface InstructorPageProps {
  instructor: PublicInstructor;
  availability: DayAvailability[] | null;
  packages: Package[] | null;
  reviews: { items: PublicReview[]; total: number } | null;
}

export function InstructorPage({
  instructor,
  availability: availabilityProp,
  packages: packagesProp,
  reviews,
}: InstructorPageProps) {
  const router = useRouter();
  const packageModal = useDisclosure();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const packages = packagesProp ?? [];
  const fullName = `${instructor.firstName} ${instructor.lastName}`;
  const location = instructor.location?.city || instructor.serviceAreas?.[0];

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    packageModal.onOpen();
  };

  const reviewItems = reviews?.items ?? [];
  const avgRating =
    reviewItems.length > 0
      ? reviewItems.reduce((sum, r) => sum + r.rating, 0) / reviewItems.length
      : 4.9;
  const totalReviews = reviews?.total ?? 0;

  // Prevent hydration mismatch by waiting for client mount
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Box bg="gray.50" minH="100vh">
        {/* Search Header */}
        <Box bg="white" borderBottom="1px solid" borderColor="gray.200" py={3}>
          <Container maxW="container.xl">
            <Flex align="center" gap={4}>
              <Button
                as={Link}
                href="/search"
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft size={16} />}
                color="gray.600"
                _hover={{ color: 'gray.900' }}
              >
                Back to Search
              </Button>
              <InputGroup size="md" flex={1} maxW="500px">
                <InputLeftElement pointerEvents="none">
                  <Search size={18} color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="Search for other instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'primary.500', bg: 'white' }}
                />
              </InputGroup>
              <Button
                colorScheme="primary"
                size="md"
                onClick={handleSearch}
                display={{ base: 'none', md: 'flex' }}
              >
                Search
              </Button>
            </Flex>
          </Container>
        </Box>

        {/* Compact Hero Section */}
        <Box bg="linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)" pt={4} pb={6}>
          <Container maxW="container.xl">
            {/* Top Bar */}
            <Flex justify="space-between" align="center" mb={4}>
              <HStack spacing={3}>
                {instructor.acceptingNewStudents !== false && (
                  <Badge
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="medium"
                    bg="green.400"
                    color="white"
                  >
                    <HStack spacing={1}>
                      <Circle size="6px" bg="white" />
                      <Text>Accepting Students</Text>
                    </HStack>
                  </Badge>
                )}
                {instructor.vehicleInfo?.transmission && (
                  <Badge
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="medium"
                    bg="whiteAlpha.200"
                    color="white"
                  >
                    <HStack spacing={1}>
                      <Icon as={Car} boxSize={3} />
                      <Text>
                        {instructor.vehicleInfo.transmission === 'automatic' ? 'Auto' : 'Manual'}
                      </Text>
                    </HStack>
                  </Badge>
                )}
              </HStack>
              <ShareButton
                url={`https://${instructor.username}.indrive.com`}
                title={`${fullName} - Driving Instructor${location ? ` in ${location}` : ''}`}
              />
            </Flex>

            {/* Instructor Info */}
            <Flex gap={4} align="center" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
              <Box position="relative" flexShrink={0}>
                <Avatar
                  size="xl"
                  name={fullName}
                  src={instructor.profileImage}
                  border="3px solid"
                  borderColor="whiteAlpha.300"
                />
                {instructor.isVerified && (
                  <Circle
                    size="24px"
                    bg="blue.500"
                    position="absolute"
                    bottom={0}
                    right={0}
                    border="2px solid"
                    borderColor="gray.900"
                  >
                    <Icon as={CheckCircle} color="white" boxSize={3} />
                  </Circle>
                )}
              </Box>

              <VStack align="start" spacing={1} flex={1}>
                <Heading as="h1" size="lg" color="white" fontWeight="bold">
                  {fullName}
                </Heading>
                {location && (
                  <HStack color="whiteAlpha.800" fontSize="sm">
                    <Icon as={MapPin} boxSize={4} />
                    <Text>{location}</Text>
                  </HStack>
                )}
              </VStack>

              {/* Desktop Stats */}
              <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
                {instructor.passRate && (
                  <VStack spacing={0} align="center">
                    <HStack spacing={1}>
                      <Icon as={Trophy} color="yellow.400" boxSize={4} />
                      <Text color="white" fontWeight="bold" fontSize="lg">
                        {instructor.passRate}%
                      </Text>
                    </HStack>
                    <Text color="whiteAlpha.700" fontSize="xs">
                      Pass Rate
                    </Text>
                  </VStack>
                )}
                <VStack spacing={0} align="center">
                  <HStack spacing={1}>
                    <Icon as={Star} color="yellow.400" fill="yellow.400" boxSize={4} />
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      {avgRating.toFixed(1)}
                    </Text>
                  </HStack>
                  <Text color="whiteAlpha.700" fontSize="xs">
                    {totalReviews || 'No'} Reviews
                  </Text>
                </VStack>
                {instructor.yearsExperience && (
                  <VStack spacing={0} align="center">
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      {instructor.yearsExperience}+
                    </Text>
                    <Text color="whiteAlpha.700" fontSize="xs">
                      Years
                    </Text>
                  </VStack>
                )}
              </HStack>
            </Flex>

            {/* Mobile Stats */}
            <HStack spacing={6} mt={4} display={{ base: 'flex', md: 'none' }} justify="center">
              <VStack spacing={0}>
                <Text color="white" fontWeight="bold">
                  {instructor.passRate || 95}%
                </Text>
                <Text color="whiteAlpha.700" fontSize="xs">
                  Pass Rate
                </Text>
              </VStack>
              <Divider orientation="vertical" h="30px" borderColor="whiteAlpha.300" />
              <VStack spacing={0}>
                <HStack spacing={1}>
                  <Icon as={Star} color="yellow.400" fill="yellow.400" boxSize={3} />
                  <Text color="white" fontWeight="bold">
                    {avgRating.toFixed(1)}
                  </Text>
                </HStack>
                <Text color="whiteAlpha.700" fontSize="xs">
                  {totalReviews || 'No'} Reviews
                </Text>
              </VStack>
              <Divider orientation="vertical" h="30px" borderColor="whiteAlpha.300" />
              <VStack spacing={0}>
                <Text color="white" fontWeight="bold">
                  {instructor.yearsExperience || 5}+
                </Text>
                <Text color="whiteAlpha.700" fontSize="xs">
                  Years
                </Text>
              </VStack>
            </HStack>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxW="container.xl" py={6}>
          <Grid templateColumns={{ base: '1fr', lg: '1fr 400px' }} gap={6}>
            {/* Left Column - Booking Calendar (Primary) */}
            <GridItem order={{ base: 2, lg: 1 }}>
              <InlineBookingSection instructor={instructor} />

              {/* Packages Section */}
              {packages.length > 0 && (
                <Card mt={6} bg="white" borderRadius="2xl" boxShadow="0 4px 20px rgba(0,0,0,0.08)">
                  <CardBody p={6}>
                    <HStack mb={4}>
                      <Icon as={Sparkles} color="green.500" />
                      <Heading size="md">Save with Packages</Heading>
                      <Badge colorScheme="green" borderRadius="full">
                        Best Value
                      </Badge>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {packages
                        .filter((p) => p.isActive)
                        .map((pkg) => (
                          <Card
                            key={pkg._id}
                            variant="outline"
                            borderRadius="xl"
                            position="relative"
                            overflow="hidden"
                            transition="all 0.2s"
                            _hover={{
                              borderColor: 'green.300',
                              shadow: 'md',
                              transform: 'translateY(-2px)',
                            }}
                            cursor="pointer"
                            onClick={() => handlePackageSelect(pkg)}
                          >
                            {pkg.discountPercent > 0 && (
                              <Box
                                position="absolute"
                                top={2}
                                right={-6}
                                bg="green.500"
                                color="white"
                                px={6}
                                py={0.5}
                                fontSize="xs"
                                fontWeight="bold"
                                transform="rotate(45deg)"
                              >
                                {pkg.discountPercent}% OFF
                              </Box>
                            )}
                            <CardBody p={4}>
                              <VStack align="stretch" spacing={2}>
                                <Heading size="sm">{pkg.name}</Heading>
                                <HStack color="gray.500" fontSize="sm">
                                  <Icon as={GraduationCap} boxSize={4} />
                                  <Text>{pkg.lessonCount} lessons</Text>
                                </HStack>
                                <Flex justify="space-between" align="end" pt={2}>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="xl" fontWeight="bold" color="green.600">
                                      £{pkg.price}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      £{(pkg.price / pkg.lessonCount).toFixed(0)}/lesson
                                    </Text>
                                  </VStack>
                                  <Icon as={ChevronRight} color="gray.400" />
                                </Flex>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                    </SimpleGrid>
                  </CardBody>
                </Card>
              )}
            </GridItem>

            {/* Right Column - About & Reviews */}
            <GridItem order={{ base: 1, lg: 2 }}>
              <VStack spacing={6} align="stretch">
                {/* Bio Card */}
                {instructor.bio && (
                  <Card bg="white" borderRadius="2xl" boxShadow="0 4px 20px rgba(0,0,0,0.08)">
                    <CardBody p={5}>
                      <Text color="gray.700" lineHeight="tall" fontSize="sm">
                        {instructor.bio}
                      </Text>
                      <Wrap spacing={2} mt={4}>
                        {instructor.vehicleInfo?.hasLearnerDualControls && (
                          <WrapItem>
                            <Tag size="sm" colorScheme="green" borderRadius="full">
                              <Icon as={Shield} boxSize={3} mr={1} />
                              Dual Controls
                            </Tag>
                          </WrapItem>
                        )}
                        {instructor.qualifications?.slice(0, 2).map((qual, idx) => (
                          <WrapItem key={idx}>
                            <Tag size="sm" colorScheme="blue" borderRadius="full">
                              <Icon as={Award} boxSize={3} mr={1} />
                              {qual}
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CardBody>
                  </Card>
                )}

                {/* Trust Badges */}
                <Card bg="white" borderRadius="2xl" boxShadow="0 4px 20px rgba(0,0,0,0.08)">
                  <CardBody p={5}>
                    <VStack spacing={3} align="stretch">
                      <HStack spacing={3}>
                        <Circle size="32px" bg="green.100">
                          <Icon as={Shield} boxSize={4} color="green.600" />
                        </Circle>
                        <Text fontSize="sm" color="gray.600">
                          DVSA Approved Instructor
                        </Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Circle size="32px" bg="blue.100">
                          <Icon as={CheckCircle} boxSize={4} color="blue.600" />
                        </Circle>
                        <Text fontSize="sm" color="gray.600">
                          DBS Checked
                        </Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Circle size="32px" bg="purple.100">
                          <Icon as={Car} boxSize={4} color="purple.600" />
                        </Circle>
                        <Text fontSize="sm" color="gray.600">
                          Fully Insured Vehicle
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Reviews */}
                {totalReviews > 0 && (
                  <Card bg="white" borderRadius="2xl" boxShadow="0 4px 20px rgba(0,0,0,0.08)">
                    <CardBody p={5}>
                      <HStack justify="space-between" mb={4}>
                        <Heading size="sm">Reviews</Heading>
                        <HStack>
                          <Icon as={Star} color="yellow.400" fill="yellow.400" boxSize={4} />
                          <Text fontWeight="bold">{avgRating.toFixed(1)}</Text>
                          <Text color="gray.500" fontSize="sm">
                            ({totalReviews})
                          </Text>
                        </HStack>
                      </HStack>
                      <VStack spacing={3} align="stretch">
                        {reviewItems.slice(0, 2).map((review) => (
                          <Box key={review._id} p={3} bg="gray.50" borderRadius="lg">
                            <HStack justify="space-between" mb={1}>
                              <Text fontWeight="medium" fontSize="sm">
                                {review.learnerName}
                              </Text>
                              <HStack spacing={0}>
                                {[...Array(5)].map((_, i) => (
                                  <Icon
                                    key={i}
                                    as={Star}
                                    boxSize={3}
                                    color={i < review.rating ? 'yellow.400' : 'gray.200'}
                                    fill={i < review.rating ? 'yellow.400' : 'none'}
                                  />
                                ))}
                              </HStack>
                            </HStack>
                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                              {review.comment}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Vehicle Info */}
                {instructor.vehicleInfo && (
                  <Card bg="white" borderRadius="2xl" boxShadow="0 4px 20px rgba(0,0,0,0.08)">
                    <CardBody p={5}>
                      <HStack spacing={4}>
                        <Circle size="48px" bg="blue.50">
                          <Icon as={Car} boxSize={6} color="blue.600" />
                        </Circle>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" fontSize="sm">
                            {instructor.vehicleInfo.make} {instructor.vehicleInfo.model}
                          </Text>
                          <HStack spacing={2}>
                            <Badge colorScheme="purple" borderRadius="full" fontSize="xs">
                              {instructor.vehicleInfo.transmission === 'automatic'
                                ? 'Automatic'
                                : 'Manual'}
                            </Badge>
                            {instructor.vehicleInfo.hasLearnerDualControls && (
                              <Badge colorScheme="green" borderRadius="full" fontSize="xs">
                                Dual Controls
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                )}

                {/* Service Areas */}
                {instructor.serviceAreas && instructor.serviceAreas.length > 0 && (
                  <Card bg="white" borderRadius="2xl" boxShadow="0 4px 20px rgba(0,0,0,0.08)">
                    <CardBody p={5}>
                      <Heading size="sm" mb={3}>
                        Areas Covered
                      </Heading>
                      <Wrap spacing={2}>
                        {instructor.serviceAreas.map((area, idx) => (
                          <WrapItem key={idx}>
                            <Tag size="md" colorScheme="blue" borderRadius="full">
                              <Icon as={MapPin} boxSize={3} mr={1} />
                              {area}
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </GridItem>
          </Grid>

          {/* Learner Ads Section */}
          <LearnerAdsSection />
        </Container>
      </Box>

      {/* Package Purchase Modal */}
      {selectedPackage && (
        <PackagePurchaseModal
          isOpen={packageModal.isOpen}
          onClose={packageModal.onClose}
          instructor={instructor}
          package={selectedPackage}
        />
      )}
    </>
  );
}

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

// Learner Ads Section Component
function LearnerAdsSection() {
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
