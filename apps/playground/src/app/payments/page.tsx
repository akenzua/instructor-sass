"use client";

import {
  AppShell,
  PageHeader,
  DataTable,
  StatusBadge,
  MetricCard,
  Button,
  HStack,
  VStack,
  Text,
  Box,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  ColorModeToggle,
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
  Download,
  TrendingUp,
  Clock,
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

interface Payment {
  id: string;
  date: string;
  learner: string;
  description: string;
  amount: string;
  status: "success" | "pending" | "error";
}

const payments: Payment[] = [
  { id: "1", date: "Jan 15, 2024", learner: "John Smith", description: "Standard Lesson", amount: "£45", status: "success" },
  { id: "2", date: "Jan 15, 2024", learner: "Emma Wilson", description: "Mock Test (2 hours)", amount: "£90", status: "success" },
  { id: "3", date: "Jan 14, 2024", learner: "James Miller", description: "Standard Lesson", amount: "£45", status: "pending" },
  { id: "4", date: "Jan 14, 2024", learner: "Sarah Davis", description: "Extended Lesson", amount: "£60", status: "success" },
  { id: "5", date: "Jan 13, 2024", learner: "Michael Brown", description: "Test Prep (3 hours)", amount: "£135", status: "success" },
  { id: "6", date: "Jan 12, 2024", learner: "Jessica Taylor", description: "Standard Lesson", amount: "£45", status: "error" },
  { id: "7", date: "Jan 12, 2024", learner: "Sophie Thomas", description: "Standard Lesson", amount: "£45", status: "success" },
  { id: "8", date: "Jan 11, 2024", learner: "John Smith", description: "Standard Lesson", amount: "£45", status: "success" },
];

const columns: Column<Payment>[] = [
  { id: "date", header: "Date", accessor: (row) => row.date, width: "120px" },
  { id: "learner", header: "Learner", accessor: (row) => <Text fontWeight="medium">{row.learner}</Text> },
  { id: "description", header: "Description", accessor: (row) => row.description },
  {
    id: "amount",
    header: "Amount",
    accessor: (row) => <Text fontWeight="semibold">{row.amount}</Text>,
    align: "right",
    width: "100px",
  },
  {
    id: "status",
    header: "Status",
    accessor: (row) => (
      <StatusBadge
        status={row.status}
        label={row.status === "success" ? "Paid" : row.status === "pending" ? "Pending" : "Failed"}
      />
    ),
    width: "120px",
  },
];

export default function PaymentsPage() {
  const router = useRouter();
  const [periodFilter, setPeriodFilter] = useState("this-week");

  return (
    <AppShell
      logo={
        <HStack spacing={2}>
          <Car size={24} color="#13C2C2" />
          <Text fontWeight="bold" fontSize="lg">InstructorHub</Text>
        </HStack>
      }
      navItems={navItems}
      activeHref="/payments"
      onNavigate={(href) => router.push(href)}
      headerRight={<ColorModeToggle />}
    >
      <PageHeader
        title="Payments"
        description="Track income and manage invoices"
        actions={
          <HStack>
            <Button variant="outline" leftIcon={Download}>Export</Button>
            <Button leftIcon={Plus}>Create Invoice</Button>
          </HStack>
        }
      />

      <HStack mt={6} spacing={4} flexWrap="wrap">
        <MetricCard
          label="This Week"
          value="£510"
          icon={CreditCard}
          change="12%"
          changeType="increase"
          helpText="vs last week"
          flex={1}
          minW="200px"
        />
        <MetricCard
          label="This Month"
          value="£1,840"
          icon={TrendingUp}
          change="8%"
          changeType="increase"
          helpText="vs last month"
          flex={1}
          minW="200px"
        />
        <MetricCard
          label="Pending"
          value="£45"
          icon={Clock}
          helpText="1 payment"
          flex={1}
          minW="200px"
        />
      </HStack>

      <Card mt={6}>
        <CardHeader>
          <HStack justify="space-between">
            <CardTitle>Recent Payments</CardTitle>
            <Select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              maxW="180px"
              size="sm"
            >
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
            </Select>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          <DataTable
            columns={columns}
            data={payments}
            keyAccessor={(row) => row.id}
            onRowClick={(row) => console.log("View payment:", row.id)}
          />
        </CardBody>
      </Card>
    </AppShell>
  );
}
