"use client";

import { useEffect, useState } from "react";
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
import { useLearners } from "@/hooks";
import { CreateLearnerModal } from "./CreateLearnerModal";
import type { Learner } from "@acme/shared";
import type { Column } from "@acme/ui";

const columns: Column<Learner>[] = [
  {
    id: "name",
    header: "Name",
    accessor: (row) => `${row.firstName} ${row.lastName}`,
    sortable: true,
  },
  {
    id: "email",
    header: "Email",
    accessor: (row) => row.email,
    sortable: true,
  },
  {
    id: "phone",
    header: "Phone",
    accessor: (row) => row.phone || "—",
  },
  {
    id: "status",
    header: "Status",
    accessor: (row) => {
      const colorMap: Record<string, string> = {
        active: "green",
        inactive: "gray",
        suspended: "red",
      };
      return (
        <Box
          as="span"
          px={2}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="medium"
          bg={`${colorMap[row.status] || "gray"}.100`}
          color={`${colorMap[row.status] || "gray"}.800`}
        >
          {row.status}
        </Box>
      );
    },
  },
  {
    id: "balance",
    header: "Balance",
    accessor: (row) => {
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(row.balance);
      return (
        <Box color={row.balance < 0 ? "red.500" : row.balance > 0 ? "green.500" : "text.default"}>
          {formatted}
        </Box>
      );
    },
  },
];

export default function LearnersPage() {
  const router = useRouter();
  const createModal = useDisclosure();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: learnersData, isLoading: learnersLoading } = useLearners({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

  const handleRowClick = (learner: Learner) => {
    router.push(`/learners/${learner._id}`);
  };

  return (
    <>
      <VStack spacing={6} align="stretch">
        <PageHeader
          title="Learners"
          description="Manage your students and their progress"
          actions={
            <Button
              leftIcon={<Plus size={16} />}
              colorScheme="primary"
              onClick={createModal.onOpen}
            >
              Add Learner
            </Button>
          }
        />

        {/* Filters */}
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search learners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <Select
            maxW="200px"
            placeholder="All statuses"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </Select>
        </HStack>

        {/* Table */}
        {learnersLoading ? (
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
              data={learnersData?.items || []}
              keyAccessor={(row) => row._id}
              onRowClick={handleRowClick}
              emptyTitle="No learners found"
              emptyDescription={search
                ? "Try adjusting your search or filters"
                : "Get started by adding your first learner"}
              emptyAction={!search ? (
                <Button
                  leftIcon={<Plus size={16} />}
                  colorScheme="primary"
                  onClick={createModal.onOpen}
                >
                  Add Learner
                </Button>
              ) : undefined}
            />

            {/* Pagination */}
            {learnersData && learnersData.totalPages > 1 && (
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
                  Page {page} of {learnersData.totalPages}
                </Box>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={page === learnersData.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </HStack>
            )}
          </Box>
        )}
      </VStack>

      <CreateLearnerModal isOpen={createModal.isOpen} onClose={createModal.onClose} />
    </>
  );
}
