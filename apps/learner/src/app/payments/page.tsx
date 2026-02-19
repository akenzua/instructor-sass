"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { ArrowLeft, PoundSterling } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@acme/ui";
import { useLearnerAuth } from "@/lib/auth";
import { paymentsApi } from "@/lib/api";

export default function PaymentsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useLearnerAuth();

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["learner", "payments"],
    queryFn: paymentsApi.getHistory,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const getPaymentDescription = (payment: any) => {
    if (payment.description) return payment.description;
    switch (payment.type) {
      case 'top-up': return 'Account top-up';
      case 'lesson-booking': return 'Lesson booking';
      case 'package-booking': return 'Package purchase';
      case 'cancellation-fee': return 'Cancellation fee';
      case 'refund': return 'Refund';
      default:
        if (payment.lessonIds?.length > 0) return 'Lesson Payment';
        return 'Account Credit';
    }
  };

  const getInstructorName = (payment: any) => {
    if (payment.instructorId && typeof payment.instructorId === 'object') {
      return `${payment.instructorId.firstName} ${payment.instructorId.lastName}`;
    }
    return '—';
  };

  // Determines if this is money coming in (positive for learner) or going out
  const isCredit = (payment: any) => {
    return payment.type === 'top-up' || payment.type === 'refund';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "green";
      case "pending":
        return "yellow";
      case "failed":
        return "red";
      case "refunded":
        return "gray";
      default:
        return "gray";
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <Box minH="100vh" bg="bg.subtle" p={8}>
        <Skeleton height="400px" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg.subtle">
      {/* Header */}
      <Box bg="bg.surface" borderBottom="1px solid" borderColor="border.subtle" px={6} py={4}>
        <HStack maxW="container.xl" mx="auto">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => router.push("/")}
          >
            Back
          </Button>
        </HStack>
      </Box>

      {/* Content */}
      <Box maxW="container.xl" mx="auto" p={6}>
        <VStack spacing={6} align="stretch">
          <PageHeader
            title="Payment History"
            subtitle="View all your past payments"
            actions={
              <Button
                colorScheme="primary"
                leftIcon={<PoundSterling size={16} />}
                onClick={() => router.push("/pay")}
              >
                Make Payment
              </Button>
            }
          />

          <Card>
            <CardBody p={0}>
              {paymentsLoading ? (
                <Box p={6}>
                  <VStack spacing={4}>
                    <Skeleton height="40px" width="100%" />
                    <Skeleton height="40px" width="100%" />
                    <Skeleton height="40px" width="100%" />
                  </VStack>
                </Box>
              ) : payments && payments.length > 0 ? (
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Description</Th>
                        <Th>Instructor</Th>
                        <Th isNumeric>Amount</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {payments.map((payment: any) => (
                        <Tr key={payment._id || payment.id}>
                          <Td>
                            <Text>
                              {format(new Date(payment.createdAt), "MMM d, yyyy")}
                            </Text>
                            <Text fontSize="xs" color="text.muted">
                              {format(new Date(payment.createdAt), "h:mm a")}
                            </Text>
                          </Td>
                          <Td>
                            <Text>{getPaymentDescription(payment)}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{getInstructorName(payment)}</Text>
                          </Td>
                          <Td fontWeight="semibold" isNumeric>
                            <Text color={isCredit(payment) ? 'green.500' : 'red.500'}>
                              {isCredit(payment) ? '+' : '−'}{formatCurrency(payment.amount)}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Box py={12} textAlign="center">
                  <Text color="text.muted" mb={4}>
                    No payment history yet
                  </Text>
                  <Button
                    colorScheme="primary"
                    onClick={() => router.push("/pay")}
                  >
                    Make Your First Payment
                  </Button>
                </Box>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}
