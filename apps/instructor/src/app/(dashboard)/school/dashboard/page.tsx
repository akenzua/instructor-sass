"use client";

import {
  Avatar,
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { useMySchool, useSchoolDashboard } from "@/hooks/queries";
import Link from "next/link";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatGBP(amount: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount / 100);
}

export default function SchoolDashboardPage() {
  const { data: school, isLoading: schoolLoading } = useMySchool();
  const { data: dashboard, isLoading: dashLoading } = useSchoolDashboard(school?._id || "");

  if (schoolLoading || dashLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!school) {
    return <Text>No school found.</Text>;
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">{school.name} — Dashboard</Heading>

        {dashboard ? (
          <>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Instructors</StatLabel>
                    <StatNumber>{dashboard.instructorCount ?? 0}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Active Learners</StatLabel>
                    <StatNumber>{dashboard.activeLearnerCount ?? 0}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Lessons</StatLabel>
                    <StatNumber>{dashboard.totalLessons ?? 0}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Revenue</StatLabel>
                    <StatNumber>{formatGBP(dashboard.totalRevenue ?? 0)}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {dashboard.monthlyRevenue && dashboard.monthlyRevenue.length > 0 && (() => {
              const maxAmt = Math.max(...dashboard.monthlyRevenue.map((m: any) => m.amount), 1);
              return (
                <Card>
                  <CardHeader>
                    <Heading size="md">Monthly Revenue (Last 6 Months)</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      {dashboard.monthlyRevenue.map((m: any) => (
                        <HStack key={`${m.year}-${m.month}`} spacing={4}>
                          <Text w="60px" fontSize="sm" fontWeight="medium">
                            {MONTH_NAMES[m.month - 1]} {m.year}
                          </Text>
                          <Box flex={1}>
                            <Progress
                              value={(m.amount / maxAmt) * 100}
                              size="lg"
                              colorScheme="green"
                              borderRadius="md"
                            />
                          </Box>
                          <Text w="100px" fontSize="sm" fontWeight="bold" textAlign="right">
                            {formatGBP(m.amount)}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              );
            })()}

            {dashboard.instructors && dashboard.instructors.length > 0 && (
              <Card>
                <CardHeader>
                  <Heading size="md">Instructor Performance</Heading>
                </CardHeader>
                <CardBody p={0}>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Instructor</Th>
                        <Th>Role</Th>
                        <Th isNumeric>Lessons</Th>
                        <Th isNumeric>Completed</Th>
                        <Th isNumeric>Learners</Th>
                        <Th isNumeric>Revenue</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {dashboard.instructors.map((inst: any) => (
                        <Tr
                          key={inst._id}
                          _hover={{ bg: "bg.subtle", cursor: "pointer" }}
                          as={Link}
                          href={`/school/instructors/${inst._id}`}
                          display="table-row"
                        >
                          <Td>
                            <HStack>
                              <Avatar size="sm" name={`${inst.firstName} ${inst.lastName}`} />
                              <Text fontWeight="medium">
                                {inst.firstName} {inst.lastName}
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge textTransform="capitalize" colorScheme={
                              inst.role === "owner" ? "purple" : inst.role === "admin" ? "blue" : "green"
                            }>
                              {inst.role}
                            </Badge>
                          </Td>
                          <Td isNumeric>{inst.totalLessons ?? 0}</Td>
                          <Td isNumeric>{inst.completedLessons ?? 0}</Td>
                          <Td isNumeric>{inst.activeLearners ?? 0}</Td>
                          <Td isNumeric>{formatGBP(inst.totalRevenue ?? 0)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            )}
          </>
        ) : (
          <Text color="text.muted">Dashboard data is not available yet.</Text>
        )}
      </VStack>
    </Box>
  );
}
