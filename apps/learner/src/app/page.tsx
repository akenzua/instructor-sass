"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  Heading,
  HStack,
  Skeleton,
  SkeletonText,
  Text,
  VStack,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  CreditCard,
  LogOut,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { PageHeader, StatusBadge, LessonCard } from "@acme/ui";
import { useLearnerAuth } from "@/lib/auth";
import { lessonsApi, authApi } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const { learner, isLoading: authLoading, isAuthenticated, logout } = useLearnerAuth();

  // Get learner profile with balance
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["learner", "profile"],
    queryFn: authApi.me,
    enabled: isAuthenticated,
  });

  // Get upcoming lessons
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ["learner", "lessons"],
    queryFn: () => lessonsApi.getMyLessons({ status: "scheduled" }),
    enabled: isAuthenticated,
  });

  // Get next lesson
  const nextLesson = lessons?.[0] || null;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (authLoading || !isAuthenticated) {
    return (
      <Box minH="100vh" bg="bg.subtle" p={8}>
        <Skeleton height="400px" />
      </Box>
    );
  }

  const balance = profile?.balance ?? learner?.balance ?? 0;
  const hasDebt = balance < 0;

  return (
    <Box minH="100vh" bg="bg.subtle">
      {/* Header */}
      <Box bg="bg.surface" borderBottom="1px solid" borderColor="border.subtle" px={6} py={4}>
        <HStack justify="space-between" maxW="container.xl" mx="auto">
          <Text fontSize="lg" fontWeight="bold" color="primary.500">
            Learner Portal
          </Text>
          <HStack spacing={4}>
            <Text fontSize="sm" color="text.muted">
              {profile?.name || learner?.name}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<LogOut size={16} />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* Content */}
      <Box maxW="container.xl" mx="auto" p={6}>
        <VStack spacing={6} align="stretch">
          <PageHeader
            title={`Welcome, ${profile?.name || learner?.name || "Learner"}!`}
            subtitle="Here's your upcoming lessons and account status"
          />

          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Main Content */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {/* Next Lesson Card */}
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      Next Lesson
                    </Heading>
                    {lessonsLoading ? (
                      <SkeletonText noOfLines={3} spacing={3} />
                    ) : nextLesson ? (
                      <Box>
                        <HStack justify="space-between" mb={4}>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="lg" fontWeight="semibold">
                              {format(new Date(nextLesson.startTime), "EEEE, MMMM d")}
                            </Text>
                            <Text color="text.muted">
                              {formatDistanceToNow(new Date(nextLesson.startTime), {
                                addSuffix: true,
                              })}
                            </Text>
                          </VStack>
                          <StatusBadge status={nextLesson.status} />
                        </HStack>

                        <Divider mb={4} />

                        <VStack align="start" spacing={3}>
                          <HStack color="text.muted">
                            <Clock size={16} />
                            <Text>
                              {format(new Date(nextLesson.startTime), "h:mm a")} -{" "}
                              {format(new Date(nextLesson.endTime), "h:mm a")}
                            </Text>
                          </HStack>

                          <HStack color="text.muted">
                            <Calendar size={16} />
                            <Badge colorScheme="blue">
                              {nextLesson.type.replace("_", " ")}
                            </Badge>
                          </HStack>

                          {nextLesson.location && (
                            <HStack color="text.muted">
                              <MapPin size={16} />
                              <Text>{nextLesson.location}</Text>
                            </HStack>
                          )}
                        </VStack>
                      </Box>
                    ) : (
                      <Box py={4} textAlign="center">
                        <Text color="text.muted">No upcoming lessons scheduled</Text>
                        <Text fontSize="sm" color="text.muted" mt={2}>
                          Contact your instructor to book a lesson
                        </Text>
                      </Box>
                    )}
                  </CardBody>
                </Card>

                {/* All Upcoming Lessons */}
                {lessons && lessons.length > 1 && (
                  <Card>
                    <CardBody>
                      <Heading size="sm" mb={4}>
                        Upcoming Lessons
                      </Heading>
                      <VStack spacing={3} align="stretch">
                        {lessons.slice(1).map((lesson) => (
                          <LessonCard
                            key={lesson.id}
                            learnerName=""
                            lessonType={lesson.type}
                            startTime={new Date(lesson.startTime)}
                            endTime={new Date(lesson.endTime)}
                            status={lesson.status}
                            paymentStatus={lesson.paymentStatus}
                            variant="compact"
                          />
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </GridItem>

            {/* Sidebar */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {/* Balance Card */}
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      Account Balance
                    </Heading>
                    {profileLoading ? (
                      <Skeleton height="60px" />
                    ) : (
                      <>
                        <Box
                          p={4}
                          bg={hasDebt ? "red.50" : "green.50"}
                          borderRadius="lg"
                          _dark={{
                            bg: hasDebt ? "red.900" : "green.900",
                          }}
                        >
                          <Text
                            fontSize="3xl"
                            fontWeight="bold"
                            color={hasDebt ? "red.500" : "green.500"}
                          >
                            {hasDebt ? "-" : ""}
                            {formatCurrency(balance)}
                          </Text>
                          <Text fontSize="sm" color="text.muted">
                            {hasDebt
                              ? "Outstanding balance"
                              : balance > 0
                              ? "Credit available"
                              : "No balance"}
                          </Text>
                        </Box>

                        {hasDebt && (
                          <Button
                            mt={4}
                            colorScheme="primary"
                            leftIcon={<CreditCard size={16} />}
                            w="full"
                            onClick={() => router.push("/pay")}
                          >
                            Pay Now
                          </Button>
                        )}
                      </>
                    )}
                  </CardBody>
                </Card>

                {/* Outstanding Balance Alert */}
                {hasDebt && (
                  <Alert status="warning" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Payment Required</AlertTitle>
                      <AlertDescription fontSize="xs">
                        Please settle your outstanding balance to continue booking lessons.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      Quick Actions
                    </Heading>
                    <VStack spacing={3}>
                      <Button
                        variant="outline"
                        w="full"
                        leftIcon={<Calendar size={16} />}
                        onClick={() => router.push("/history")}
                      >
                        View Lesson History
                      </Button>
                      <Button
                        variant="outline"
                        w="full"
                        leftIcon={<DollarSign size={16} />}
                        onClick={() => router.push("/payments")}
                      >
                        Payment History
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>
          </Grid>
        </VStack>
      </Box>
    </Box>
  );
}
