"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { Plus, Search } from "lucide-react";
import { DataTable, PageHeader } from "@acme/ui";
import type { Column } from "@acme/ui";
import { useLessons } from "@/hooks";
import { LessonDrawer } from "@/components";
import type { Lesson } from "@acme/shared";
import { format } from "date-fns";

const columns: Column<Lesson>[] = [
  {
    id: "date",
    header: "Date",
    sortable: true,
    accessor: (row) => format(new Date(row.startTime), "MMM d, yyyy"),
  },
  {
    id: "time",
    header: "Time",
    accessor: (row) =>
      `${format(new Date(row.startTime), "h:mm a")} - ${format(new Date(row.endTime), "h:mm a")}`,
  },
  {
    id: "learner",
    header: "Learner",
    sortable: true,
    accessor: (row) => {
      if (row.learner) {
        return `${row.learner.firstName || ''} ${row.learner.lastName || ''}`.trim() || 'Unknown';
      }
      return 'Unknown';
    },
  },
  {
    id: "type",
    header: "Type",
    accessor: (row) => {
      const typeLabels: Record<string, string> = {
        standard: "Standard",
        "test-prep": "Test Prep",
        "mock-test": "Mock Test",
        motorway: "Motorway",
        refresher: "Refresher",
      };
      return typeLabels[row.type] || row.type;
    },
  },
  {
    id: "status",
    header: "Status",
    accessor: (row) => {
      const statusMap: Record<string, { label: string; color: string }> = {
        scheduled: { label: "Scheduled", color: "blue" },
        completed: { label: "Completed", color: "green" },
        cancelled: { label: "Cancelled", color: "red" },
        "no-show": { label: "No Show", color: "orange" },
      };
      const status = statusMap[row.status] || { label: row.status, color: "gray" };
      return (
        <Box
          as="span"
          px={2}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="medium"
          bg={`${status.color}.100`}
          color={`${status.color}.800`}
        >
          {status.label}
        </Box>
      );
    },
  },
  {
    id: "paymentStatus",
    header: "Payment",
    accessor: (row) => {
      const paymentMap: Record<string, { label: string; color: string }> = {
        pending: { label: "Pending", color: "yellow" },
        paid: { label: "Paid", color: "green" },
        refunded: { label: "Refunded", color: "purple" },
        waived: { label: "Waived", color: "gray" },
      };
      const payment = paymentMap[row.paymentStatus] || { label: row.paymentStatus, color: "gray" };
      return (
        <Box
          as="span"
          px={2}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="medium"
          bg={`${payment.color}.100`}
          color={`${payment.color}.800`}
        >
          {payment.label}
        </Box>
      );
    },
  },
  {
    id: "price",
    header: "Price",
    accessor: (row) =>
      new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(row.price),
  },
];

export default function LessonsPage() {
  const router = useRouter();
  const drawer = useDisclosure();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"scheduled" | "completed" | "cancelled" | "no-show" | "">("");
  const [paymentFilter, setPaymentFilter] = useState<"pending" | "paid" | "refunded" | "waived" | "">("");
  const [page, setPage] = useState(1);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const { data: lessonsData, isLoading: lessonsLoading } = useLessons({
    page,
    limit: 10,
    status: statusFilter || undefined,
    paymentStatus: paymentFilter || undefined,
  });

  const handleRowClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    drawer.onOpen();
  };

  return (
    <>
      <VStack spacing={6} align="stretch">
        <PageHeader
          title="Lessons"
          description="View and manage all your lessons"
          actions={
            <Button
              leftIcon={<Plus size={16} />}
              colorScheme="primary"
              onClick={() => router.push("/calendar")}
            >
              Schedule Lesson
            </Button>
          }
        />

        {/* Filters */}
        <HStack spacing={4} flexWrap="wrap">
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search lessons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <Select
            maxW="180px"
            placeholder="All statuses"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setPage(1);
            }}
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </Select>

          <Select
            maxW="180px"
            placeholder="All payments"
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value as typeof paymentFilter);
              setPage(1);
            }}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
            <option value="waived">Waived</option>
          </Select>
        </HStack>

        {/* Table */}
        {lessonsLoading ? (
          <Skeleton height="400px" borderRadius="lg" />
        ) : (
          <Box
            bg="bg.surface"
            borderRadius="lg"
            border="1px solid"
            borderColor="border.subtle"
            overflow="hidden"
          >
            <DataTable
              columns={columns}
              data={lessonsData?.items || []}
              keyAccessor={(row) => row._id}
              onRowClick={handleRowClick}
              emptyTitle="No lessons found"
              emptyDescription={statusFilter || paymentFilter
                ? "Try adjusting your filters"
                : "Schedule your first lesson from the calendar"}
              emptyAction={!statusFilter && !paymentFilter ? (
                <Button
                  leftIcon={<Plus size={16} />}
                  colorScheme="primary"
                  onClick={() => router.push("/calendar")}
                >
                  Schedule Lesson
                </Button>
              ) : undefined}
            />

            {/* Pagination */}
            {lessonsData && lessonsData.totalPages > 1 && (
              <HStack justify="center" p={4} borderTop="1px solid" borderColor="border.subtle">
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Box px={4}>
                  Page {page} of {lessonsData.totalPages}
                </Box>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={page === lessonsData.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </HStack>
            )}
          </Box>
        )}
      </VStack>

      <LessonDrawer
        lesson={selectedLesson}
        isOpen={drawer.isOpen}
        onClose={() => {
          drawer.onClose();
          setSelectedLesson(null);
        }}
      />
    </>
  );
}
