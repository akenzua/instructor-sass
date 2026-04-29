'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardBody,
  Grid,
  GridItem,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
  Badge,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Icon,
} from '@chakra-ui/react';
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  GraduationCap,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
} from 'lucide-react';
import { MetricCard, PageHeader } from '@acme/ui';
import { useAuth } from '@/lib/auth';
import { useDashboardStats } from '@/hooks';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';

const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const TYPE_COLORS: Record<string, string> = {
  standard: '#4F46E5',
  'test-prep': '#10B981',
  'mock-test': '#F59E0B',
  motorway: '#8B5CF6',
  refresher: '#06B6D4',
};

function formatGBP(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

function formatLessonType(type: string) {
  const labels: Record<string, string> = {
    standard: 'Standard',
    'test-prep': 'Test Prep',
    'mock-test': 'Mock Test',
    motorway: 'Motorway',
    refresher: 'Refresher',
  };
  return labels[type] || type;
}

// ─── Custom chart tooltip ────────────────────────────────────────────────────

function EarningsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Box bg="bg.surface" border="1px solid" borderColor="border.subtle" borderRadius="md" p={3} boxShadow="lg">
      <Text fontSize="xs" fontWeight="semibold" mb={1}>{label}</Text>
      <Text fontSize="sm" color="green.500">{formatGBP(payload[0]?.value ?? 0)}</Text>
      <Text fontSize="xs" color="text.muted">{payload[1]?.value ?? 0} lessons</Text>
    </Box>
  );
}

// ─── Skeleton cards ──────────────────────────────────────────────────────────

function SkeletonCard({ h = '300px' }: { h?: string }) {
  return (
    <Card>
      <CardBody>
        <Skeleton height="20px" width="40%" mb={4} />
        <Skeleton height={h} />
      </CardBody>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { instructor } = useAuth();
  const router = useRouter();
  const { data: stats, isLoading } = useDashboardStats();
  const isSchoolMember = !!(instructor as any)?.schoolId;

  // Redirect non-teaching owner/admin to school dashboard
  const inst = instructor as any;
  const isAdminOnly = inst?.schoolId && ['owner', 'admin'].includes(inst?.role) && !inst?.isTeaching;
  useEffect(() => {
    if (isAdminOnly) {
      router.replace('/school/dashboard');
    }
  }, [isAdminOnly, router]);

  if (isAdminOnly) return null;

  return (
    <VStack spacing={6} align="stretch">
      <PageHeader title={`Welcome back, ${instructor?.firstName ?? ''}!`} />

      {/* ── KPI Strip ─────────────────────────────────────────────────────── */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: isSchoolMember ? 3 : 4 }} spacing={4}>
        {isLoading ? (
          Array.from({ length: isSchoolMember ? 3 : 4 }).map((_, i) => (
            <Skeleton key={i} height="120px" borderRadius="lg" />
          ))
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
              value={`${stats?.activeLearners ?? 0} / ${stats?.totalLearners ?? 0}`}
              helpText="Active / Total"
            />
            {!isSchoolMember && (
              <MetricCard
                icon={DollarSign}
                label="Monthly Earnings"
                value={formatGBP(stats?.monthlyEarnings ?? 0)}
                change={stats?.earningsChange !== undefined ? `${Math.abs(stats.earningsChange)}%` : undefined}
                changeType={
                  stats?.earningsChange !== undefined
                    ? stats.earningsChange >= 0
                      ? 'increase'
                      : 'decrease'
                    : undefined
                }
                helpText="vs. last month"
              />
            )}
          </>
        )}
      </SimpleGrid>

      {/* ── Monthly Earnings History (6 months) ──────────────────────────── */}
      {!isSchoolMember && (isLoading ? (
        <SkeletonCard h="260px" />
      ) : (
        <Card>
          <CardBody>
            <Heading size="sm" mb={4}>Monthly Earnings (6 months)</Heading>
            <Box h="260px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyHistory ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `£${v}`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <RechartsTooltip
                    formatter={(value: any, name: any) => [
                      name === 'Earnings' ? formatGBP(value ?? 0) : `${value ?? 0} lessons`,
                      name,
                    ]}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="earnings" name="Earnings" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar yAxisId="right" dataKey="lessons" name="Lessons" fill="#A5B4FC" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      ))}

      {/* ── Row 2: Earnings Chart + Today's Schedule ──────────────────────── */}
      <Grid templateColumns={{ base: '1fr', lg: isSchoolMember ? '1fr' : '3fr 2fr' }} gap={6}>
        {/* Earnings Trend */}
        {!isSchoolMember && (
        <GridItem>
          {isLoading ? (
            <SkeletonCard h="280px" />
          ) : (
            <Card>
              <CardBody>
                <Heading size="sm" mb={4}>Earnings Trend (12 Weeks)</Heading>
                <Box h="280px">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.weeklyTrend ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `£${v}`}
                      />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                      <RechartsTooltip content={<EarningsTooltip />} />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="earnings"
                        stroke="#4F46E5"
                        fill="url(#earningsGrad)"
                        strokeWidth={2}
                        name="Earnings"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="lessons"
                        fill="#A5B4FC"
                        radius={[2, 2, 0, 0]}
                        barSize={14}
                        name="Lessons"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>
          )}
        </GridItem>
        )}

        {/* Today's Schedule */}
        <GridItem>
          {isLoading ? (
            <SkeletonCard h="280px" />
          ) : (
            <Card>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Heading size="sm">Today&apos;s Schedule</Heading>
                  <Badge colorScheme="blue">{stats?.todaySchedule?.length ?? 0} lessons</Badge>
                </HStack>
                {stats?.todaySchedule && stats.todaySchedule.length > 0 ? (
                  <VStack spacing={3} align="stretch" maxH="280px" overflowY="auto">
                    {stats.todaySchedule.map((lesson) => {
                      const start = new Date(lesson.startTime);
                      const end = new Date(lesson.endTime);
                      const learnerName = lesson.learner
                        ? `${lesson.learner.firstName || ''} ${lesson.learner.lastName || ''}`.trim()
                        : 'Unknown';
                      return (
                        <Box
                          key={lesson._id}
                          p={3}
                          borderRadius="md"
                          border="1px solid"
                          borderColor="border.subtle"
                          bg={lesson.status === 'completed' ? 'green.50' : 'bg.surface'}
                          _dark={{
                            bg: lesson.status === 'completed' ? 'green.900' : undefined,
                          }}
                        >
                          <HStack justify="space-between" mb={1}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                            </Text>
                            <Badge
                              colorScheme={lesson.status === 'completed' ? 'green' : 'blue'}
                              size="sm"
                            >
                              {lesson.status === 'completed' ? 'Done' : formatLessonType(lesson.type)}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm">{learnerName}</Text>
                          {lesson.pickupLocation && (
                            <HStack fontSize="xs" color="text.muted" mt={1}>
                              <MapPin size={12} />
                              <Text>{lesson.pickupLocation}</Text>
                            </HStack>
                          )}
                          {lesson.learner?.phone && (
                            <HStack fontSize="xs" color="text.muted" mt={0.5}>
                              <Phone size={12} />
                              <Text>{lesson.learner.phone}</Text>
                            </HStack>
                          )}
                        </Box>
                      );
                    })}
                  </VStack>
                ) : (
                  <Box py={10} textAlign="center">
                    <Text color="text.muted" fontSize="sm">No lessons today</Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          )}
        </GridItem>
      </Grid>

      {/* ── Row 3: Lesson Types + Completion Rate + Unpaid ────────────────── */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {/* Lesson Type Breakdown */}
        {isLoading ? (
          <SkeletonCard h="200px" />
        ) : (
          <Card>
            <CardBody>
              <Heading size="sm" mb={4}>Lesson Types</Heading>
              {stats?.lessonTypes && stats.lessonTypes.length > 0 ? (
                <Box h="200px">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.lessonTypes}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {stats.lessonTypes.map((entry, idx) => (
                          <Cell
                            key={entry.type}
                            fill={TYPE_COLORS[entry.type] || CHART_COLORS[idx % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <RechartsTooltip
                        formatter={(value: any, name: any) => [`${value ?? 0} lessons`, name]}
                      />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Text color="text.muted" fontSize="sm" textAlign="center" py={6}>
                  No lesson data yet
                </Text>
              )}
            </CardBody>
          </Card>
        )}

        {/* Completion Rate */}
        {isLoading ? (
          <SkeletonCard h="200px" />
        ) : (
          <Card>
            <CardBody>
              <Heading size="sm" mb={4}>Completion Rate (3 months)</Heading>
              <VStack spacing={4} align="stretch">
                <Box textAlign="center">
                  <Text fontSize="4xl" fontWeight="bold" color="green.500">
                    {stats?.completionStats?.completionRate ?? 0}%
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    {stats?.completionStats?.completed ?? 0} of {stats?.completionStats?.total ?? 0} lessons completed
                  </Text>
                </Box>
                <Progress
                  value={stats?.completionStats?.completionRate ?? 0}
                  colorScheme="green"
                  borderRadius="full"
                  size="lg"
                />
                <SimpleGrid columns={3} spacing={2}>
                  <VStack spacing={0}>
                    <HStack spacing={1}>
                      <Icon as={CheckCircle2} boxSize={3} color="green.500" />
                      <Text fontSize="lg" fontWeight="bold">{stats?.completionStats?.completed ?? 0}</Text>
                    </HStack>
                    <Text fontSize="xs" color="text.muted">Completed</Text>
                  </VStack>
                  <VStack spacing={0}>
                    <HStack spacing={1}>
                      <Icon as={XCircle} boxSize={3} color="red.400" />
                      <Text fontSize="lg" fontWeight="bold">{stats?.completionStats?.cancelled ?? 0}</Text>
                    </HStack>
                    <Text fontSize="xs" color="text.muted">Cancelled</Text>
                  </VStack>
                  <VStack spacing={0}>
                    <HStack spacing={1}>
                      <Icon as={AlertCircle} boxSize={3} color="orange.400" />
                      <Text fontSize="lg" fontWeight="bold">{stats?.completionStats?.noShow ?? 0}</Text>
                    </HStack>
                    <Text fontSize="xs" color="text.muted">No-show</Text>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Unpaid / Outstanding */}
        {!isSchoolMember && (isLoading ? (
          <SkeletonCard h="200px" />
        ) : (
          <Card>
            <CardBody>
              <Heading size="sm" mb={4}>Outstanding Payments</Heading>
              <VStack spacing={4} align="stretch">
                <Box textAlign="center">
                  <Text
                    fontSize="4xl"
                    fontWeight="bold"
                    color={(stats?.unpaidAmount ?? 0) > 0 ? 'red.500' : 'green.500'}
                  >
                    {formatGBP(stats?.unpaidAmount ?? 0)}
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    across {stats?.unpaidLessons ?? 0} unpaid lesson{(stats?.unpaidLessons ?? 0) !== 1 ? 's' : ''}
                  </Text>
                </Box>
                <Divider />
                <VStack spacing={1}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="text.muted">Active learners</Text>
                    <Text fontSize="sm" fontWeight="medium">{stats?.activeLearners ?? 0}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="text.muted">Total learners</Text>
                    <Text fontSize="sm" fontWeight="medium">{stats?.totalLearners ?? 0}</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="text.muted">Earnings change</Text>
                    <HStack spacing={1}>
                      <Icon
                        as={(stats?.earningsChange ?? 0) >= 0 ? TrendingUp : TrendingDown}
                        boxSize={3}
                        color={(stats?.earningsChange ?? 0) >= 0 ? 'green.500' : 'red.500'}
                      />
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={(stats?.earningsChange ?? 0) >= 0 ? 'green.500' : 'red.500'}
                      >
                        {stats?.earningsChange ?? 0}%
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* ── Row 4: Upcoming Test Dates + Recent Activity ─────────────────── */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        {/* Upcoming Test Dates */}
        {isLoading ? (
          <SkeletonCard h="200px" />
        ) : (
          <Card>
            <CardBody>
              <HStack justify="space-between" mb={4}>
                <Heading size="sm">Upcoming Test Dates</Heading>
                <Icon as={GraduationCap} boxSize={5} color="primary.500" />
              </HStack>
              {stats?.upcomingTestDates && stats.upcomingTestDates.length > 0 ? (
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Learner</Th>
                      <Th>Test Date</Th>
                      <Th isNumeric>Days Away</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {stats.upcomingTestDates.map((td) => {
                      const testDate = new Date(td.testDate);
                      const daysAway = Math.ceil(
                        (testDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <Tr key={td._id}>
                          <Td fontWeight="medium">
                            {td.firstName || ''} {td.lastName || ''}
                          </Td>
                          <Td>{format(testDate, 'dd MMM yyyy')}</Td>
                          <Td isNumeric>
                            <Badge
                              colorScheme={daysAway <= 7 ? 'red' : daysAway <= 30 ? 'orange' : 'green'}
                            >
                              {daysAway} day{daysAway !== 1 ? 's' : ''}
                            </Badge>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              ) : (
                <Text color="text.muted" fontSize="sm" textAlign="center" py={6}>
                  No upcoming test dates
                </Text>
              )}
            </CardBody>
          </Card>
        )}

        {/* Recent Activity */}
        {isLoading ? (
          <SkeletonCard h="200px" />
        ) : (
          <Card>
            <CardBody>
              <Heading size="sm" mb={4}>Recent Activity</Heading>
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <VStack spacing={2} align="stretch" maxH="270px" overflowY="auto">
                  {stats.recentActivity.map((item) => {
                    const isCompleted = item.status === 'completed';
                    const when = item.completedAt || item.cancelledAt || item.startTime;
                    const learnerName = item.learner
                      ? `${item.learner.firstName || ''} ${item.learner.lastName || ''}`.trim()
                      : 'Unknown';
                    return (
                      <HStack
                        key={item._id}
                        p={2}
                        borderRadius="md"
                        spacing={3}
                        _hover={{ bg: 'bg.subtle' }}
                      >
                        <Icon
                          as={isCompleted ? CheckCircle2 : XCircle}
                          boxSize={4}
                          color={isCompleted ? 'green.500' : 'red.400'}
                          flexShrink={0}
                        />
                        <Box flex={1} minW={0}>
                          <HStack justify="space-between">
                            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                              {learnerName}
                            </Text>
                            <Text fontSize="xs" color="text.muted" flexShrink={0}>
                              {formatGBP(item.price)}
                            </Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Badge size="sm" colorScheme={isCompleted ? 'green' : 'red'}>
                              {isCompleted ? 'Completed' : 'Cancelled'}
                            </Badge>
                            <Text fontSize="xs" color="text.muted">
                              {formatDistanceToNow(new Date(when), { addSuffix: true })}
                            </Text>
                          </HStack>
                        </Box>
                      </HStack>
                    );
                  })}
                </VStack>
              ) : (
                <Text color="text.muted" fontSize="sm" textAlign="center" py={6}>
                  No recent activity
                </Text>
              )}
            </CardBody>
          </Card>
        )}
      </Grid>
    </VStack>
  );
}
