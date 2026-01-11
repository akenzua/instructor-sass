"use client";

import {
  AppShell,
  PageHeader,
  CalendarShell,
  ScheduleList,
  Button,
  HStack,
  Text,
  Box,
  ColorModeToggle,
} from "@acme/ui";
import type { CalendarView, ScheduleDay } from "@acme/ui";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  Car,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Learners", icon: Users, href: "/learners" },
  { label: "Lessons", icon: Calendar, href: "/lessons" },
  { label: "Payments", icon: CreditCard, href: "/payments" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

const scheduleData: ScheduleDay[] = [
  {
    date: "January 20, 2024",
    dayLabel: "Monday",
    items: [
      { id: "1", startTime: "9:00 AM", endTime: "10:00 AM", status: "booked", title: "John Smith", subtitle: "Standard Lesson" },
      { id: "2", startTime: "10:30 AM", endTime: "12:30 PM", status: "booked", title: "Emma Wilson", subtitle: "Mock Test (2 hours)" },
      { id: "3", startTime: "2:00 PM", endTime: "3:00 PM", status: "booked", title: "James Miller", subtitle: "Standard Lesson" },
      { id: "4", startTime: "4:00 PM", endTime: "5:00 PM", status: "available", title: "Available" },
    ],
  },
  {
    date: "January 21, 2024",
    dayLabel: "Tuesday",
    items: [
      { id: "5", startTime: "8:00 AM", endTime: "9:00 AM", status: "booked", title: "Sarah Davis", subtitle: "Extended Lesson" },
      { id: "6", startTime: "10:00 AM", endTime: "11:00 AM", status: "pending", title: "Pending Confirmation", subtitle: "New booking request" },
      { id: "7", startTime: "1:00 PM", endTime: "2:00 PM", status: "blocked", title: "Blocked", subtitle: "Personal appointment" },
      { id: "8", startTime: "3:00 PM", endTime: "4:00 PM", status: "booked", title: "Michael Brown", subtitle: "Test Prep" },
    ],
  },
  {
    date: "January 22, 2024",
    dayLabel: "Wednesday",
    items: [
      { id: "9", startTime: "9:00 AM", endTime: "10:00 AM", status: "booked", title: "Jessica Taylor", subtitle: "Standard Lesson" },
      { id: "10", startTime: "11:00 AM", endTime: "12:00 PM", status: "booked", title: "Sophie Thomas", subtitle: "Standard Lesson" },
      { id: "11", startTime: "2:00 PM", endTime: "3:00 PM", status: "available", title: "Available" },
      { id: "12", startTime: "3:30 PM", endTime: "4:30 PM", status: "available", title: "Available" },
    ],
  },
  {
    date: "January 23, 2024",
    dayLabel: "Thursday",
    items: [
      { id: "13", startTime: "10:00 AM", endTime: "11:00 AM", status: "booked", title: "John Smith", subtitle: "Standard Lesson" },
      { id: "14", startTime: "12:00 PM", endTime: "1:00 PM", status: "blocked", title: "Lunch Break" },
      { id: "15", startTime: "2:00 PM", endTime: "4:00 PM", status: "booked", title: "Emma Wilson", subtitle: "Mock Test (2 hours)" },
    ],
  },
  {
    date: "January 24, 2024",
    dayLabel: "Friday",
    items: [
      { id: "16", startTime: "9:00 AM", endTime: "10:00 AM", status: "booked", title: "James Miller", subtitle: "Test Day!" },
      { id: "17", startTime: "11:00 AM", endTime: "12:00 PM", status: "available", title: "Available" },
      { id: "18", startTime: "2:00 PM", endTime: "3:00 PM", status: "booked", title: "Sarah Davis", subtitle: "Standard Lesson" },
    ],
  },
];

export default function LessonsPage() {
  const router = useRouter();
  const [view, setView] = useState<CalendarView>("week");
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekTitle = () => {
    const baseWeek = 20 + weekOffset;
    return `Week of January ${baseWeek}, 2024`;
  };

  return (
    <AppShell
      logo={
        <HStack spacing={2}>
          <Car size={24} color="#13C2C2" />
          <Text fontWeight="bold" fontSize="lg">InstructorHub</Text>
        </HStack>
      }
      navItems={navItems}
      activeHref="/lessons"
      onNavigate={(href) => router.push(href)}
      headerRight={<ColorModeToggle />}
    >
      <PageHeader
        title="Lessons"
        description="View and manage scheduled lessons"
        actions={
          <HStack>
            <Button variant="outline">Block Time</Button>
            <Button leftIcon={Plus}>New Lesson</Button>
          </HStack>
        }
      />

      <Box mt={6}>
        <CalendarShell
          title={getWeekTitle()}
          view={view}
          onViewChange={setView}
          onPrevious={() => setWeekOffset((o) => o - 1)}
          onNext={() => setWeekOffset((o) => o + 1)}
          onToday={() => setWeekOffset(0)}
        >
          <ScheduleList
            days={scheduleData}
            onSlotClick={(item) => {
              if (item.status === "available") {
                alert("Open booking form for this slot");
              } else if (item.status === "booked") {
                alert(`View details for ${item.title}`);
              }
            }}
            emptyTitle="No lessons scheduled"
            emptyDescription="Your calendar is empty for this period"
          />
        </CalendarShell>
      </Box>
    </AppShell>
  );
}
