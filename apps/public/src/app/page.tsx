'use client';

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
  Badge,
  Stack,
} from '@chakra-ui/react';
import {
  CheckCircle,
  XCircle,
  Users,
  CalendarCheck,
  DollarSign,
  Star,
  Shield,
  MapPin,
  Car,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [year, setYear] = useState(2026);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setYear(new Date().getFullYear());
  }, []);

  return (
    <Box>
      {/* ── HERO ─────────────────────────────────────────────────────────────
          Chapter 4 — Desire: build a fully-booked business without admin burden
          Two audiences: instructors (paying customer) and learners (marketplace)
      ─────────────────────────────────────────────────────────────────────── */}
      <Box
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={{ base: 20, md: 32 }}
      >
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Badge
              bg="whiteAlpha.300"
              color="white"
              px={4}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="medium"
            >
              Free for driving instructors — no subscription, no catch
            </Badge>
            <Heading
              as="h1"
              size={{ base: '2xl', md: '3xl' }}
              fontWeight="extrabold"
              lineHeight="shorter"
            >
              Stop managing your business.
              <br />
              Start growing it.
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} maxW="2xl" opacity={0.9}>
              InDrive gives driving instructors a free platform to fill their diary with motivated
              learners, automate their admin, and get paid — without the chaos.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} pt={2}>
              <Button
                as={Link}
                href="/instructor/signup"
                size="lg"
                bg="white"
                color="purple.700"
                fontWeight="bold"
                _hover={{ bg: 'gray.100', transform: 'translateY(-1px)' }}
                transition="all 0.2s"
                px={8}
              >
                Create Your Free Profile
              </Button>
              <Button
                as={Link}
                href="/search"
                size="lg"
                variant="outline"
                borderColor="whiteAlpha.700"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                px={8}
              >
                I&apos;m a Learner — Find an Instructor
              </Button>
            </Stack>
            <Text fontSize="sm" opacity={0.7}>
              Free forever · No credit card · Set up in 5 minutes
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* ── PROBLEM ──────────────────────────────────────────────────────────
          Chapter 5 — Villain: the fragmented, outdated way the industry works
          External: admin overload, no students
          Internal: overwhelmed, unprofessional, uncertain
          Philosophical: great teachers deserve great businesses
      ─────────────────────────────────────────────────────────────────────── */}
      <Box bg="gray.900" color="white" py={{ base: 12, md: 16 }}>
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Heading as="h2" size="lg" color="white">
              Sound familiar?
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
              <ProblemCard text="Managing bookings on WhatsApp, writing in a paper diary, chasing payments at the end of every lesson." />
              <ProblemCard text="Spending Sunday evenings re-organising your week instead of resting after a long day of teaching." />
              <ProblemCard text="Relying entirely on word-of-mouth with no way to know whether next month's diary will be full or empty." />
            </SimpleGrid>
            <Text
              color="gray.400"
              maxW="2xl"
              fontSize={{ base: 'md', md: 'lg' }}
              fontStyle="italic"
            >
              &ldquo;You didn&apos;t become a driving instructor to spend your evenings doing admin.
              You became one to help people get on the road safely.&rdquo;
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* ── GUIDE ────────────────────────────────────────────────────────────
          Chapter 6 — Empathy + Authority
          InDrive is the Guide, not the hero
      ─────────────────────────────────────────────────────────────────────── */}
      <Box bg="purple.50" py={{ base: 12, md: 16 }}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} alignItems="center">
            <VStack align="start" spacing={6}>
              <Badge colorScheme="purple">We understand</Badge>
              <Heading as="h2" size="lg">
                Great instructors deserve great tools — not more paperwork.
              </Heading>
              <Text color="gray.700" fontSize="md">
                InDrive was built specifically for UK ADIs. Not adapted from a generic booking
                platform. Not a spreadsheet dressed up as software. We know the industry, we know
                the admin burden, and we know that every hour you spend on paperwork is an hour
                you&apos;re not teaching.
              </Text>
              <Text color="gray.700" fontSize="md">
                That&apos;s why we made it free. If we&apos;re not bringing you real students and
                saving you real time, we haven&apos;t earned the right to charge you anything.
              </Text>
              <HStack spacing={6} flexWrap="wrap">
                <AuthorityBadge icon={Shield} label="Built for UK ADIs" />
                <AuthorityBadge icon={DollarSign} label="Powered by Stripe" />
                <AuthorityBadge icon={CheckCircle} label="DVSA-aligned syllabus" />
              </HStack>
            </VStack>
            <VStack spacing={4}>
              <StatCard
                value="40,000+"
                label="ADIs in the UK still managing their business with paper diaries and WhatsApp"
              />
              <StatCard
                value="£1.8bn"
                label="Spent on driving lessons in the UK every year — most of it still booked by phone"
              />
              <StatCard value="5 mins" label="Average time to set up a complete InDrive profile" />
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── PROCESS PLAN ─────────────────────────────────────────────────────
          Chapter 7 — The 3-step plan for instructors
          Remove confusion: tell them exactly what to do
      ─────────────────────────────────────────────────────────────────────── */}
      <Container maxW="container.xl" py={{ base: 12, md: 20 }}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Badge colorScheme="purple">How it works</Badge>
            <Heading as="h2" size="lg">
              Three steps to a fully-booked business
            </Heading>
            <Text color="gray.600" maxW="2xl">
              No training required. No long setup. No monthly fee.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
            <StepCard
              step="1"
              icon={BookOpen}
              title="Create Your Profile"
              description="Set up your availability, pricing, service area, and qualifications in under 5 minutes. Your professional shopfront — live instantly."
            />
            <StepCard
              step="2"
              icon={Users}
              title="Get Found by Learners"
              description="Learners in your area search by location, price, and transmission type. Your profile shows up. They book you directly."
            />
            <StepCard
              step="3"
              icon={CalendarCheck}
              title="Teach and Get Paid"
              description="Bookings, reminders, and payments happen automatically. You open the app, see your week, and focus on what you are great at — teaching."
            />
          </SimpleGrid>
          <Button as={Link} href="/instructor/signup" size="lg" colorScheme="purple" px={10}>
            Create Your Free Profile
          </Button>
        </VStack>
      </Container>

      {/* ── AGREEMENT PLAN ───────────────────────────────────────────────────
          Chapter 7 — The promise plan: remove fear before the ask
      ─────────────────────────────────────────────────────────────────────── */}
      <Box bg="gray.50" py={{ base: 12, md: 16 }}>
        <Container maxW="container.xl">
          <VStack spacing={10}>
            <VStack spacing={3} textAlign="center">
              <Badge colorScheme="green">Our promise</Badge>
              <Heading as="h2" size="lg">
                No risk. No lock-in. No surprises.
              </Heading>
              <Text color="gray.600" maxW="xl">
                We believe great instructors should not have to gamble on software before
                it&apos;s earned their trust.
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
              <PromiseCard
                title="Free forever"
                description="No subscription. No setup fee. No monthly charge. We earn only when you earn."
              />
              <PromiseCard
                title="You control your diary"
                description="Learners can only book slots you have opened. You set your hours, your prices, your rules."
              />
              <PromiseCard
                title="Secure payments"
                description="Every payment is processed by Stripe — the same system trusted by Amazon and Shopify."
              />
              <PromiseCard
                title="Leave anytime"
                description="No lock-in contracts. If InDrive is not working for you, you can leave. Your data stays yours."
              />
              <PromiseCard
                title="5-minute setup"
                description="If you can use a phone, you can use InDrive. No training needed, no onboarding calls."
              />
              <PromiseCard
                title="Real learners, real bookings"
                description="We only take a small fee when a learner books through our marketplace. No students means no charge."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* ── STAKES + TRANSFORMATION ──────────────────────────────────────────
          Chapter 9 — Failure: cost of inaction (brief, not overdone)
          Chapter 10-11 — Success + identity shift
      ─────────────────────────────────────────────────────────────────────── */}
      <Box bg="gray.900" color="white" py={{ base: 12, md: 16 }}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} alignItems="start">
            {/* Failure side */}
            <VStack align="start" spacing={6}>
              <Badge bg="red.900" color="red.300" px={3} py={1} borderRadius="md" fontSize="xs">
                Without InDrive
              </Badge>
              <Heading as="h3" size="md" color="white">
                An empty diary does not fix itself.
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Every week you rely on word-of-mouth alone, another instructor with an online
                profile picks up a student you never knew existed.
              </Text>
              <VStack align="start" spacing={3}>
                <FailureItem text="Unpredictable income — feast one month, famine the next" />
                <FailureItem text="Hours lost to admin that could be spent teaching or resting" />
                <FailureItem text="No way to collect reviews that build your reputation automatically" />
                <FailureItem text="Learners who cannot find you online choose someone who can be found" />
              </VStack>
            </VStack>

            {/* Success side */}
            <VStack align="start" spacing={6}>
              <Badge
                bg="green.900"
                color="green.300"
                px={3}
                py={1}
                borderRadius="md"
                fontSize="xs"
              >
                With InDrive
              </Badge>
              <Heading as="h3" size="md" color="white">
                Your business runs while you teach.
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Instructors who join InDrive move from overworked solo operators to confident
                business owners with a structure that grows their reputation automatically.
              </Text>
              <VStack align="start" spacing={3}>
                <SuccessItem text="A fuller, more predictable diary" />
                <SuccessItem text="Automated bookings, reminders, and payments" />
                <SuccessItem text="A professional profile building your reputation 24/7" />
                <SuccessItem text="More time teaching — and more time off" />
              </VStack>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── DIRECT CTA ───────────────────────────────────────────────────────
          Chapter 8 — The direct call to action
          Chapters 11-12 — Transformation + controlling idea
      ─────────────────────────────────────────────────────────────────────── */}
      <Box
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={{ base: 16, md: 24 }}
      >
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Heading as="h2" size={{ base: 'xl', md: '2xl' }} fontWeight="bold">
              From overworked instructor to confident business owner.
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} maxW="2xl" opacity={0.9}>
              A driving instructor&apos;s business grows when learner demand and daily operations
              run through one simple, free system. That is what InDrive is.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} pt={2}>
              <Button
                as={Link}
                href="/instructor/signup"
                size="lg"
                bg="white"
                color="purple.700"
                fontWeight="bold"
                _hover={{ bg: 'gray.100', transform: 'translateY(-1px)' }}
                transition="all 0.2s"
                px={8}
              >
                Create Your Free Profile
              </Button>
              <Button
                as={Link}
                href="/search"
                size="lg"
                variant="outline"
                borderColor="whiteAlpha.700"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                px={8}
              >
                I&apos;m a Learner — Find an Instructor
              </Button>
            </Stack>
            <Text fontSize="sm" opacity={0.7}>
              Free forever · No credit card · Set up in 5 minutes
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* ── FOR LEARNERS ─────────────────────────────────────────────────────
          Serves the demand side: learner-facing value proposition
      ─────────────────────────────────────────────────────────────────────── */}
      {isMounted && (
        <Container maxW="container.xl" py={{ base: 12, md: 20 }}>
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Badge colorScheme="blue">For learners</Badge>
              <Heading as="h2" size="lg">
                Find the right instructor in minutes
              </Heading>
              <Text color="gray.600" maxW="2xl">
                Every instructor on InDrive is a certified ADI. Real availability, transparent
                pricing, and genuine verified reviews.
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              <FeatureCard
                icon={MapPin}
                title="Search your area"
                description="Enter your postcode and instantly see certified instructors near you with real-time availability and service area maps."
              />
              <FeatureCard
                icon={Star}
                title="Compare and choose"
                description="See verified pass rates, real learner reviews, transparent pricing, and vehicle type. Choose the instructor who is right for you."
              />
              <FeatureCard
                icon={Car}
                title="Book and get started"
                description="Book online, pay securely, and get automatic reminders before every lesson. Track your progress from first lesson to test day."
              />
            </SimpleGrid>
            <Button as={Link} href="/search" size="lg" colorScheme="blue" px={10}>
              Find an Instructor Near Me
            </Button>
          </VStack>
        </Container>
      )}

      {/* ── TRANSITIONAL CTA ─────────────────────────────────────────────────
          Chapter 8 — For instructors not ready to sign up yet
          Lead magnet: free checklist
      ─────────────────────────────────────────────────────────────────────── */}
      <Box bg="purple.50" py={{ base: 12, md: 16 }}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <VStack align="start" spacing={4}>
              <Badge colorScheme="purple">Free resource for instructors</Badge>
              <Heading as="h3" size="md">
                Not ready to sign up yet?
              </Heading>
              <Text color="gray.700">
                Download our free checklist:{' '}
                <strong>
                  10 Things Every Driving Instructor Needs to Run a Professional Business.
                </strong>
              </Text>
              <Text color="gray.600" fontSize="sm">
                Audit your current setup in 5 minutes. Each item maps to a real improvement you
                can make today — with or without InDrive.
              </Text>
            </VStack>
            <VStack align={{ base: 'start', md: 'center' }} spacing={3}>
              <Button
                as={Link}
                href="/instructor/checklist"
                size="lg"
                colorScheme="purple"
                variant="outline"
                px={8}
              >
                Get the Free Checklist
              </Button>
              <Text fontSize="sm" color="gray.500">
                No email required. Instant download.
              </Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── FOOTER ───────────────────────────────────────────────────────────*/}
      <Box as="footer" bg="gray.900" color="gray.400" py={12}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            <VStack align="start" spacing={4}>
              <Heading size="md" color="white">
                InDrive
              </Heading>
              <Text fontSize="sm">The smarter way to run a driving instruction business.</Text>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="semibold" color="white">
                For Learners
              </Text>
              <Link href="/search">Find Instructors</Link>
              <Link href="/how-it-works">How It Works</Link>
            </VStack>
            <VStack align="start" spacing={2}>
              <Text fontWeight="semibold" color="white">
                For Instructors
              </Text>
              <Link href="/instructor/signup">Create Free Profile</Link>
              <Link href="/instructor/login">Instructor Login</Link>
              <Link href="/instructor/checklist">Free Checklist</Link>
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
              © {year} InDrive. All rights reserved.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function ProblemCard({ text }: { text: string }) {
  return (
    <Box p={6} bg="gray.800" borderRadius="lg" border="1px solid" borderColor="gray.700">
      <HStack spacing={3} align="start">
        <Icon as={XCircle} color="red.400" boxSize={5} mt={0.5} flexShrink={0} />
        <Text color="gray.300" fontSize="sm">
          {text}
        </Text>
      </HStack>
    </Box>
  );
}

function AuthorityBadge({ icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <HStack spacing={2}>
      <Icon as={icon} color="purple.500" boxSize={4} />
      <Text fontSize="sm" fontWeight="medium" color="gray.700">
        {label}
      </Text>
    </HStack>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <Box
      p={6}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="purple.100"
      w="full"
      boxShadow="sm"
    >
      <VStack align="start" spacing={1}>
        <Heading size="xl" color="purple.600">
          {value}
        </Heading>
        <Text fontSize="sm" color="gray.600">
          {label}
        </Text>
      </VStack>
    </Box>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <VStack
      p={8}
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.200"
      align="start"
      spacing={4}
      position="relative"
      boxShadow="sm"
      _hover={{ boxShadow: 'md', borderColor: 'purple.200' }}
      transition="all 0.2s"
    >
      <Box
        position="absolute"
        top={4}
        right={4}
        w={8}
        h={8}
        bg="purple.100"
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="sm" fontWeight="bold" color="purple.600">
          {step}
        </Text>
      </Box>
      <Box p={3} bg="purple.50" borderRadius="lg" color="purple.500">
        <Icon as={icon} boxSize={6} />
      </Box>
      <Heading as="h3" size="sm">
        {title}
      </Heading>
      <Text color="gray.600" fontSize="sm">
        {description}
      </Text>
    </VStack>
  );
}

function PromiseCard({ title, description }: { title: string; description: string }) {
  return (
    <HStack
      p={5}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="green.100"
      align="start"
      spacing={4}
      boxShadow="sm"
    >
      <Icon as={CheckCircle} color="green.500" boxSize={5} mt={0.5} flexShrink={0} />
      <VStack align="start" spacing={1}>
        <Text fontWeight="semibold" fontSize="sm">
          {title}
        </Text>
        <Text color="gray.600" fontSize="sm">
          {description}
        </Text>
      </VStack>
    </HStack>
  );
}

function FailureItem({ text }: { text: string }) {
  return (
    <HStack spacing={3} align="start">
      <Icon as={XCircle} color="red.400" boxSize={5} mt={0.5} flexShrink={0} />
      <Text color="gray.300" fontSize="sm">
        {text}
      </Text>
    </HStack>
  );
}

function SuccessItem({ text }: { text: string }) {
  return (
    <HStack spacing={3} align="start">
      <Icon as={CheckCircle} color="green.400" boxSize={5} mt={0.5} flexShrink={0} />
      <Text color="gray.300" fontSize="sm">
        {text}
      </Text>
    </HStack>
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
      <Box p={3} bg="blue.50" borderRadius="lg" color="blue.500">
        <Icon as={icon} boxSize={6} strokeWidth={2} />
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
