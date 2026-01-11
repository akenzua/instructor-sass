"use client";

import {
  AppShell,
  PageHeader,
  MetricCard,
  DataTable,
  StatusBadge,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Text,
  HStack,
  VStack,
  Box,
  Button,
  TimelineItem,
  SkeletonMetric,
  SkeletonTable,
  ColorModeToggle,
  Badge,
} from "@acme/ui";
import type { Column } from "@acme/ui";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  Car,
  Clock,
  TrendingUp,
  Plus,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Learners", icon: Users, href: "/learners" },
  { label: "Lessons", icon: Calendar, href: "/lessons" },
  { label: "Payments", icon: CreditCard, href: "/payments" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

interface TodayLesson {
  id: string;
  time: string;
  learner: string;
  type: string;
  status: "scheduled" | "in-progress" | "completed";
}

const todayLessons: TodayLesson[] = [
  { id: "1", time: "9:00 AM", learner: "John Smith", type: "Standard", status: "completed" },
  { id: "2", time: "11:00 AM", learner: "Emma Wilson", type: "Mock Test", status: "in-progress" },
  { id: "3", time: "2:00 PM", learner: "James Miller", type: "Standard", status: "scheduled" },
  { id: "4", time: "4:00 PM", learner: "Sarah Davis", type: "Extended", status: "scheduled" },
];

const lessonColumns: Column<TodayLesson>[] = [
  { id: "time", header: "Time", accessor: (row) => row.time, width: "100px" },
  { id: "learner", header: "Learner", accessor: (row) => <Text fontWeight="medium">{row.learner}</Text> },
  { id: "type", header: "Type", accessor: (row) => row.type },
  { id: "status", header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppShell
      logo={
        <HStack spacing={2}>
          <Car size={24} color="#13C2C2" />
          <Text fontWeight="bold" fontSize="lg">InstructorHub</Text>
        </HStack>
      }
      navItems={navItems}
      activeHref="/"
      onNavigate={(href) => router.push(href)}
      headerRight={<ColorModeToggle />}
    >
      <PageHeader
        title="Welcome back, Sarah!"
        description="Here's what's happening with your lessons today"
        actions={
          <Button leftIcon={Plus} onClick={() => router.push("/lessons")}>
            New Lesson
          </Button>
        }
      />

      <Box mt={6}>
        {loading ? (
          <SkeletonMetric count={4} />
        ) : (
          <HStack spacing={4} flexWrap="wrap">
            <MetricCard
              label="Total Learners"
              value={42}
              icon={Users}
              change="8%"
              changeType="increase"
              helpText="vs last month"
              flex={1}
              minW="200px"
            />
            <MetricCard
              label="Lessons This Week"
              value={24}
              icon={Calendar}
              change="3"
              changeType="increase"
              helpText="from last week"
              flex={1}
              minW="200px"
            />
            <MetricCard
              label="Revenue"
              value="£1,840"
              icon={CreditCard}
              change="15%"
              changeType="increase"
              helpText="vs last week"
              flex={1}
              minW="200px"
            />
            <MetricCard
              label="Pass Rate"
              value="87%"
              icon={TrendingUp}
              change="5%"
              changeType="increase"
              helpText="this quarter"
              flex={1}
              minW="200px"
            />
          </HStack>
        )}
      </Box>

      <HStack mt={8} spacing={6} align="start" flexWrap={{ base: "wrap", lg: "nowrap" }}>
        <Box flex={2} minW="300px">
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <CardTitle>Today's Lessons</CardTitle>
                <Badge colorScheme="brand">{todayLessons.length} lessons</Badge>
              </HStack>
            </CardHeader>
            <CardBody p={0}>
              {loading ? (
                <Box p={4}>
                  <SkeletonTable rows={4} columns={4} />
                </Box>
              ) : (
                <DataTable
                  columns={lessonColumns}
                  data={todayLessons}
                  keyAccessor={(row) => row.id}
                  onRowClick={(row) => console.log("Clicked:", row.learner)}
                />
              )}
            </CardBody>
          </Card>
        </Box>

        <Box flex={1} minW="280px">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardBody>
              <VStack spacing={0} align="stretch">
                <TimelineItem
                  icon={CheckCircle}
                  title="Lesson Completed"
                  timestamp="1 hour ago"
                  description="John Smith - Standard lesson"
                  tone="success"
                />
                <TimelineItem
                  icon={CreditCard}
                  title="Payment Received"
                  timestamp="2 hours ago"
                  description="Emma Wilson paid £90"
                  tone="primary"
                />
                <TimelineItem
                  icon={Calendar}
                  title="Lesson Booked"
                  timestamp="3 hours ago"
                  description="James Miller - Jan 20, 2:00 PM"
                  tone="neutral"
                />
                <TimelineItem
                  icon={AlertCircle}
                  title="Test Reminder"
                  timestamp="Yesterday"
                  description="Sarah Davis - Test on Jan 25"
                  tone="warning"
                  isLast
                />
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </HStack>
    </AppShell>
  );
}
