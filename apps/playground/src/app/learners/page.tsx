"use client";

import {
  AppShell,
  PageHeader,
  DataTable,
  StatusBadge,
  Button,
  HStack,
  Text,
  EmptyState,
  ColorModeToggle,
  Card,
  CardBody,
  TextInput,
  Select,
} from "@acme/ui";
import type { Column } from "@acme/ui";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  Car,
  Plus,
  Search,
  Filter,
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

interface Learner {
  id: string;
  name: string;
  email: string;
  phone: string;
  lessons: number;
  status: "active" | "inactive" | "pending";
  testDate: string | null;
}

const learners: Learner[] = [
  { id: "1", name: "John Smith", email: "john@example.com", phone: "07700 123456", lessons: 12, status: "active", testDate: "Mar 15, 2024" },
  { id: "2", name: "Emma Wilson", email: "emma@example.com", phone: "07700 234567", lessons: 8, status: "active", testDate: "Apr 2, 2024" },
  { id: "3", name: "James Miller", email: "james@example.com", phone: "07700 345678", lessons: 15, status: "active", testDate: "Feb 28, 2024" },
  { id: "4", name: "Sarah Davis", email: "sarah@example.com", phone: "07700 456789", lessons: 5, status: "pending", testDate: null },
  { id: "5", name: "Michael Brown", email: "michael@example.com", phone: "07700 567890", lessons: 20, status: "active", testDate: "Jan 25, 2024" },
  { id: "6", name: "Jessica Taylor", email: "jessica@example.com", phone: "07700 678901", lessons: 3, status: "active", testDate: null },
  { id: "7", name: "David Anderson", email: "david@example.com", phone: "07700 789012", lessons: 18, status: "inactive", testDate: null },
  { id: "8", name: "Sophie Thomas", email: "sophie@example.com", phone: "07700 890123", lessons: 10, status: "active", testDate: "Mar 20, 2024" },
];

const columns: Column<Learner>[] = [
  {
    id: "name",
    header: "Name",
    accessor: (row) => (
      <HStack>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "#13C2C2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 600,
            fontSize: "12px",
          }}
        >
          {row.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <Text fontWeight="medium">{row.name}</Text>
      </HStack>
    ),
  },
  { id: "email", header: "Email", accessor: (row) => row.email },
  { id: "phone", header: "Phone", accessor: (row) => row.phone },
  { id: "lessons", header: "Lessons", accessor: (row) => row.lessons, align: "center", width: "100px" },
  { id: "status", header: "Status", accessor: (row) => <StatusBadge status={row.status} />, width: "120px" },
  {
    id: "testDate",
    header: "Test Date",
    accessor: (row) => row.testDate || <Text color="fg.muted">Not scheduled</Text>,
  },
];

export default function LearnersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredLearners = learners.filter((learner) => {
    const matchesSearch = learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || learner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        title="Learners"
        description="Manage your students and track their progress"
        actions={
          <Button leftIcon={Plus}>Add Learner</Button>
        }
      />

      <Card mt={6}>
        <CardBody>
          <HStack spacing={4} mb={4}>
            <TextInput
              placeholder="Search learners..."
              leftIcon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              maxW="300px"
            />
            <Select
              placeholder="All statuses"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              maxW="200px"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </Select>
          </HStack>

          <DataTable
            columns={columns}
            data={filteredLearners}
            keyAccessor={(row) => row.id}
            onRowClick={(row) => router.push(`/learners/${row.id}`)}
            emptyTitle="No learners found"
            emptyDescription={searchQuery || statusFilter ? "Try adjusting your search or filters" : "Add your first learner to get started"}
            emptyAction={!searchQuery && !statusFilter ? <Button leftIcon={Plus}>Add Learner</Button> : undefined}
          />
        </CardBody>
      </Card>
    </AppShell>
  );
}
