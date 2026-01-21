import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { Car, MapPin, Calendar, Star, Shield, Clock } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={{ base: 16, md: 24 }}
      >
        <Container maxW="container.xl">
          <VStack spacing={6} textAlign="center">
            <Heading
              as="h1"
              size={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
            >
              Find the Perfect Driving Instructor
            </Heading>
            <Text fontSize={{ base: "lg", md: "xl" }} maxW="2xl" opacity={0.9}>
              Book lessons with certified instructors in your area. 
              View real-time availability, transparent pricing, and verified reviews.
            </Text>
            <HStack spacing={4} pt={4}>
              <Button
                as={Link}
                href="/search"
                size="lg"
                colorScheme="whiteAlpha"
                bg="white"
                color="purple.600"
                _hover={{ bg: "gray.100" }}
              >
                Find Instructors
              </Button>
              <Button
                as={Link}
                href="/for-instructors"
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                For Instructors
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={{ base: 12, md: 20 }}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Heading as="h2" size="lg">
              Why Choose InDrive?
            </Heading>
            <Text color="gray.600" maxW="2xl">
              We connect learners with qualified driving instructors, 
              making it easy to book lessons and start your journey to independence.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            <FeatureCard
              icon={MapPin}
              title="Local Instructors"
              description="Find instructors in your area with coverage maps and service areas."
            />
            <FeatureCard
              icon={Calendar}
              title="Real-Time Availability"
              description="See live availability and book lessons that fit your schedule."
            />
            <FeatureCard
              icon={Star}
              title="Verified Reviews"
              description="Read genuine reviews from learners who've passed their test."
            />
            <FeatureCard
              icon={Shield}
              title="Certified Instructors"
              description="All instructors are verified ADIs with current badges."
            />
            <FeatureCard
              icon={Clock}
              title="Flexible Booking"
              description="Book single lessons or save with multi-lesson packages."
            />
            <FeatureCard
              icon={Car}
              title="Modern Vehicles"
              description="Learn in well-maintained, dual-control vehicles."
            />
          </SimpleGrid>
        </VStack>
      </Container>

      {/* CTA Section */}
      <Box bg="gray.50" py={{ base: 12, md: 16 }}>
        <Container maxW="container.xl">
          <VStack spacing={6} textAlign="center">
            <Heading as="h2" size="lg">
              Ready to Start Driving?
            </Heading>
            <Text color="gray.600" maxW="xl">
              Join thousands of learners who've found their perfect instructor through InDrive.
            </Text>
            <Button
              as={Link}
              href="/search"
              size="lg"
              colorScheme="primary"
            >
              Find an Instructor Near You
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" bg="gray.900" color="gray.400" py={12}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            <VStack align="start" spacing={4}>
              <Heading size="md" color="white">
                InDrive
              </Heading>
              <Text fontSize="sm">
                The modern way to find and book driving lessons.
              </Text>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="semibold" color="white">
                For Learners
              </Text>
              <Link href="/search">Find Instructors</Link>
              <Link href="/how-it-works">How It Works</Link>
              <Link href="/pricing">Pricing</Link>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="semibold" color="white">
                For Instructors
              </Text>
              <Link href="/for-instructors">Join InDrive</Link>
              <Link href="/instructor-login">Instructor Login</Link>
              <Link href="/resources">Resources</Link>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="semibold" color="white">
                Company
              </Text>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </VStack>
          </SimpleGrid>
          <Box borderTop="1px solid" borderColor="gray.700" mt={8} pt={8}>
            <Text fontSize="sm" textAlign="center">
              © {new Date().getFullYear()} InDrive. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <VStack
      p={6}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      align="start"
      spacing={4}
    >
      <Box
        p={3}
        bg="primary.50"
        borderRadius="lg"
        color="primary.500"
      >
        <Icon as={icon} boxSize={6} />
      </Box>
      <VStack align="start" spacing={2}>
        <Heading as="h3" size="sm">
          {title}
        </Heading>
        <Text color="gray.600" fontSize="sm">
          {description}
        </Text>
      </VStack>
    </VStack>
  );
}
