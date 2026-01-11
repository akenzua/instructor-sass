"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Grid,
  Heading,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";
import { MetricCard, PageHeader } from "@acme/ui";
import { useAuth } from "@/lib/auth";
import { useLessonStats, useLessons } from "@/hooks";
import { AppShell } from "@/components/AppShell";
import { UpcomingLessons } from "@/components/UpcomingLessons";

export default function DashboardPage() {
  const router = useRouter();
  const { instructor, isLoading: authLoading } = useAuth();
  const { data: stats, isLoading: statsLoading } = useLessonStats();
  const { data: lessonsData, isLoading: lessonsLoading } = useLessons({
    status: "scheduled",
    limit: 5,
  });

  useEffect(() => {
    if (!authLoading && !instructor) {
      router.push("/login");
    }
  }, [authLoading, instructor, router]);

  if (authLoading || !instructor) {
    return (
      <Box minH="100vh" bg="bg.subtle" p={8}>
        <Skeleton height="200px" />
      </Box>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <AppShell>
      <VStack spacing={8} align="stretch">
        <PageHeader
          title={`Welcome back, ${instructor.firstName}!`}
          subtitle="Here's an overview of your teaching activity"
        />

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          {statsLoading ? (
            <>
              <Skeleton height="120px" borderRadius="lg" />
              <Skeleton height="120px" borderRadius="lg" />
              <Skeleton height="120px" borderRadius="lg" />
              <Skeleton height="120px" borderRadius="lg" />
            </>
          ) : (
            <>
              <MetricCard
                icon={Calendar}
                label="Total Lessons"
                value={(stats?.total ?? 0).toString()}
                helpText="All time"
              />
              <MetricCard
                icon={Clock}
                label="Scheduled"
                value={(stats?.scheduled ?? 0).toString()}
                helpText="Upcoming lessons"
              />
              <MetricCard
                icon={Users}
                label="Completed"
                value={(stats?.completed ?? 0).toString()}
                helpText="This month"
              />
              <MetricCard
                icon={DollarSign}
                label="Revenue"
                value={formatCurrency(stats?.totalRevenue ?? 0)}
                helpText="This month"
              />
            </>
          )}
        </SimpleGrid>

        {/* Main Content Grid */}
        <Grid
          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
          gap={6}
        >
          {/* Upcoming Lessons */}
          <Box>
            <Heading size="md" mb={4}>
              Upcoming Lessons
            </Heading>
            {lessonsLoading ? (
              <VStack spacing={3}>
                <Skeleton height="80px" width="100%" borderRadius="md" />
                <Skeleton height="80px" width="100%" borderRadius="md" />
                <Skeleton height="80px" width="100%" borderRadius="md" />
              </VStack>
            ) : lessonsData?.items && lessonsData.items.length > 0 ? (
              <UpcomingLessons lessons={lessonsData.items} />
            ) : (
              <Box
                p={8}
                textAlign="center"
                bg="bg.surface"
                borderRadius="lg"
                border="1px solid"
                borderColor="border.subtle"
              >
                <Text color="text.muted">No upcoming lessons scheduled</Text>
              </Box>
            )}
          </Box>

          {/* Quick Actions */}
          <Box>
            <Heading size="md" mb={4}>
              Quick Stats
            </Heading>
            <VStack spacing={3} align="stretch">
              <Box
                p={4}
                bg="bg.surface"
                borderRadius="lg"
                border="1px solid"
                borderColor="border.subtle"
              >
                <Text fontSize="sm" color="text.muted" mb={1}>
                  Cancelled
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats?.cancelled ?? 0}
                </Text>
              </Box>
              <Box
                p={4}
                bg="bg.surface"
                borderRadius="lg"
                border="1px solid"
                borderColor="border.subtle"
              >
                <Text fontSize="sm" color="text.muted" mb={1}>
                  No Shows
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats?.noShow ?? 0}
                </Text>
              </Box>
              <Box
                p={4}
                bg="bg.surface"
                borderRadius="lg"
                border="1px solid"
                borderColor="border.subtle"
              >
                <Text fontSize="sm" color="text.muted" mb={1}>
                  Completion Rate
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats && stats.total > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0}
                  %
                </Text>
              </Box>
            </VStack>
          </Box>
        </Grid>
      </VStack>
    </AppShell>
  );
}
