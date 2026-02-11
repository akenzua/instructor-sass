'use client';

import { Box, Grid, Heading, SimpleGrid, Skeleton, Text, VStack } from '@chakra-ui/react';
import { Calendar, Users, DollarSign, Clock } from 'lucide-react';
import { MetricCard, PageHeader } from '@acme/ui';
import { useAuth } from '@/lib/auth';
import { useLessonStats, useLessons } from '@/hooks';
import { UpcomingLessons } from '@/components/UpcomingLessons';

export default function DashboardPage() {
  const { instructor } = useAuth();
  const { data: stats, isLoading: statsLoading } = useLessonStats();
  const { data: lessonsData, isLoading: lessonsLoading } = useLessons({
    status: 'scheduled',
    limit: 5,
  });

  console.log({ instructor });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <VStack spacing={8} align="stretch">
      <PageHeader
        title={`Welcome back, ${instructor?.firstName ?? ''}!`}
        //   subtitle="Here's an overview of your teaching activity"
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
              label="Today's Lessons"
              value={(stats?.todayLessons ?? 0).toString()}
              helpText="Scheduled for today"
            />
            <MetricCard
              icon={Clock}
              label="This Week"
              value={(stats?.weekLessons ?? 0).toString()}
              helpText="Upcoming this week"
            />
            <MetricCard
              icon={Users}
              label="Active Learners"
              value={(stats?.activeLearners ?? 0).toString()}
              helpText="Total active"
            />
            <MetricCard
              icon={DollarSign}
              label="Monthly Earnings"
              value={formatCurrency(stats?.monthlyEarnings ?? 0)}
              helpText="This month"
            />
          </>
        )}
      </SimpleGrid>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
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
                Unpaid Lessons
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {stats?.unpaidLessons ?? 0}
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
                Unpaid Amount
              </Text>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={stats?.unpaidAmount ? 'red.500' : undefined}
              >
                {formatCurrency(stats?.unpaidAmount ?? 0)}
              </Text>
            </Box>
          </VStack>
        </Box>
      </Grid>
    </VStack>
  );
}
