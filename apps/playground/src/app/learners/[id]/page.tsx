"use client";

import {
  AppShell,
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardFooter,
  StatusBadge,
  Button,
  HStack,
  VStack,
  Text,
  Box,
  MetricCard,
  TimelineItem,
  ColorModeToggle,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@acme/ui";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  Car,
  Plus,
  Edit,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Award,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Learners", icon: Users, href: "/learners" },
  { label: "Lessons", icon: Calendar, href: "/lessons" },
  { label: "Payments", icon: CreditCard, href: "/payments" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

const learnerData = {
  id: "1",
  name: "John Smith",
  email: "john.smith@example.com",
  phone: "07700 123456",
  status: "active" as const,
  lessons: 12,
  testDate: "March 15, 2024",
  vehicle: "Manual",
  notes: "Making excellent progress. Ready for test prep.",
  joinDate: "November 1, 2023",
};

const lessonHistory = [
  { id: "1", date: "Jan 15, 2024", time: "10:00 AM", type: "Mock Test", status: "completed" as const, notes: "Excellent performance" },
  { id: "2", date: "Jan 12, 2024", time: "2:00 PM", type: "Standard", status: "completed" as const, notes: "Worked on roundabouts" },
  { id: "3", date: "Jan 10, 2024", time: "10:00 AM", type: "Extended", status: "cancelled" as const, notes: "Learner cancelled - illness" },
  { id: "4", date: "Jan 8, 2024", time: "11:00 AM", type: "Standard", status: "completed" as const, notes: "Parallel parking practice" },
];

export default function LearnerDetailPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <AppShell
      logo={
        <HStack spacing={2}>
          <Car size={24} color="#13C2C2" />
          <Text fontWeight="bold" fontSize="lg">InstructorHub</Text>
        </HStack>
      }
      navItems={navItems}
      activeHref="/learners"
      onNavigate={(href) => router.push(href)}
      headerRight={<ColorModeToggle />}
    >
      <PageHeader
        title={learnerData.name}
        description="Learner profile and lesson history"
        breadcrumbs={
          <Breadcrumb fontSize="sm">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/learners">Learners</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">{learnerData.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        }
        actions={
          <HStack>
            <Button variant="outline" leftIcon={Edit}>Edit</Button>
            <Button leftIcon={Plus}>Book Lesson</Button>
          </HStack>
        }
      />

      <HStack mt={6} spacing={6} align="start" flexWrap={{ base: "wrap", lg: "nowrap" }}>
        <VStack flex={1} minW="300px" spacing={6} align="stretch">
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <CardTitle>Profile</CardTitle>
                <StatusBadge status={learnerData.status} />
              </HStack>
            </CardHeader>
            <CardBody>
              <HStack mb={4}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    backgroundColor: "#13C2C2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "24px",
                  }}
                >
                  JS
                </div>
                <Box>
                  <Text fontWeight="semibold" fontSize="lg">{learnerData.name}</Text>
                  <Text fontSize="sm" color="fg.muted">Member since {learnerData.joinDate}</Text>
                </Box>
              </HStack>

              <VStack align="start" spacing={3}>
                <HStack>
                  <Mail size={16} />
                  <Text fontSize="sm">{learnerData.email}</Text>
                </HStack>
                <HStack>
                  <Phone size={16} />
                  <Text fontSize="sm">{learnerData.phone}</Text>
                </HStack>
                <HStack>
                  <Car size={16} />
                  <Text fontSize="sm">{learnerData.vehicle} transmission</Text>
                </HStack>
                <HStack>
                  <Calendar size={16} />
                  <Text fontSize="sm">Test: {learnerData.testDate}</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <HStack spacing={4}>
            <MetricCard
              label="Lessons"
              value={learnerData.lessons}
              icon={Calendar}
              flex={1}
            />
            <MetricCard
              label="Hours"
              value={learnerData.lessons}
              icon={Clock}
              flex={1}
            />
          </HStack>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardBody>
              <Text fontSize="sm">{learnerData.notes}</Text>
            </CardBody>
            <CardFooter>
              <Button size="sm" variant="outline">Edit Notes</Button>
            </CardFooter>
          </Card>
        </VStack>

        <Box flex={2} minW="400px">
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <CardTitle>Lesson History</CardTitle>
                <Button size="sm" variant="outline">View All</Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={0} align="stretch">
                {lessonHistory.map((lesson, index) => (
                  <TimelineItem
                    key={lesson.id}
                    icon={
                      lesson.status === "completed"
                        ? CheckCircle
                        : lesson.status === "cancelled"
                        ? XCircle
                        : Clock
                    }
                    title={`${lesson.type} Lesson`}
                    timestamp={`${lesson.date} at ${lesson.time}`}
                    description={
                      <VStack align="start" spacing={1}>
                        <StatusBadge status={lesson.status} size="sm" />
                        {lesson.notes && (
                          <Text fontSize="xs" color="fg.muted">{lesson.notes}</Text>
                        )}
                      </VStack>
                    }
                    tone={
                      lesson.status === "completed"
                        ? "success"
                        : lesson.status === "cancelled"
                        ? "danger"
                        : "neutral"
                    }
                    isLast={index === lessonHistory.length - 1}
                  />
                ))}
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </HStack>
    </AppShell>
  );
}
