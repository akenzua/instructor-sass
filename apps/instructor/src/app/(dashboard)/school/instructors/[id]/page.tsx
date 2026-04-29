"use client";

import { useParams } from "next/navigation";
import {
  Avatar,
  Badge,
  Box,
  Button,
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
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useMySchool, useSchoolInstructorDetail, useSchoolInstructorLearners } from "@/hooks/queries";

function formatGBP(amount: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount / 100);
}

export default function InstructorDetailPage() {
  const params = useParams();
  const instructorId = params.id as string;
  const { data: school, isLoading: schoolLoading } = useMySchool();
  const schoolId = school?._id || "";
  const { data, isLoading } = useSchoolInstructorDetail(schoolId, instructorId);
  const { data: learners, isLoading: learnersLoading } = useSchoolInstructorLearners(schoolId, instructorId);

  if (schoolLoading || isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!data?.instructor) {
    return <Text>Instructor not found.</Text>;
  }

  const { instructor, stats, recentLessons } = data;

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Button as={Link} href="/school/dashboard" leftIcon={<ArrowLeft size={16} />} variant="ghost" size="sm">
            Back to Dashboard
          </Button>
        </HStack>

        <HStack spacing={4}>
          <Avatar size="lg" name={`${instructor.firstName} ${instructor.lastName}`} />
          <VStack align="start" spacing={0}>
            <Heading size="lg">{instructor.firstName} {instructor.lastName}</Heading>
            <HStack>
              <Text color="text.muted">{instructor.email}</Text>
              <Badge textTransform="capitalize" colorScheme={
                instructor.role === "owner" ? "purple" : instructor.role === "admin" ? "blue" : "green"
              }>
                {instructor.role}
              </Badge>
            </HStack>
          </VStack>
        </HStack>

        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Lessons</StatLabel>
                <StatNumber>{stats.totalLessons}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Completed</StatLabel>
                <StatNumber>{stats.completedLessons}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Scheduled</StatLabel>
                <StatNumber>{stats.scheduledLessons}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Active Learners</StatLabel>
                <StatNumber>{stats.activeLearners}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Revenue</StatLabel>
                <StatNumber>{formatGBP(stats.totalRevenue)}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Learners Table */}
        <Card>
          <CardHeader>
            <HStack>
              <Users size={20} />
              <Heading size="md">Learners ({learners?.length || 0})</Heading>
            </HStack>
          </CardHeader>
          <CardBody p={0}>
            {learnersLoading ? (
              <Box textAlign="center" py={6}><Spinner /></Box>
            ) : !learners || learners.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Text color="text.muted">No learners yet.</Text>
              </Box>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Learner</Th>
                    <Th isNumeric>Lessons</Th>
                    <Th isNumeric>Spent</Th>
                    <Th>Syllabus Progress</Th>
                    <Th>Readiness</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {learners.map((l: any) => {
                    const progressPct = l.progress.totalTopics > 0
                      ? Math.round((l.progress.completed / l.progress.totalTopics) * 100)
                      : 0;
                    return (
                      <Tr
                        key={l._id}
                        _hover={{ bg: "bg.subtle", cursor: "pointer" }}
                        as={Link}
                        href={`/school/instructors/${instructorId}/learners/${l._id}`}
                        display="table-row"
                      >
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{l.firstName} {l.lastName}</Text>
                            <Text fontSize="xs" color="text.muted">{l.email}</Text>
                          </VStack>
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="medium">{l.completedLessons}</Text>
                          <Text fontSize="xs" color="text.muted">of {l.totalLessons}</Text>
                        </Td>
                        <Td isNumeric>{formatGBP(l.totalSpent)}</Td>
                        <Td>
                          <VStack align="start" spacing={1} minW="120px">
                            <Progress
                              value={progressPct}
                              size="sm"
                              w="100%"
                              colorScheme={progressPct >= 80 ? "green" : progressPct >= 40 ? "blue" : "gray"}
                              borderRadius="full"
                            />
                            <Text fontSize="xs" color="text.muted">
                              {l.progress.completed}/{l.progress.totalTopics} topics ({progressPct}%)
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          {l.testReadiness ? (
                            <Badge
                              colorScheme={
                                l.testReadiness === "test-ready" ? "green"
                                  : l.testReadiness === "nearly-ready" ? "yellow"
                                  : "gray"
                              }
                              textTransform="capitalize"
                            >
                              {l.testReadiness.replace("-", " ")}
                            </Badge>
                          ) : (
                            <Text fontSize="xs" color="text.muted">—</Text>
                          )}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={l.status === "active" ? "green" : l.status === "paused" ? "yellow" : "gray"}
                            textTransform="capitalize"
                          >
                            {l.status}
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Recent Lessons</Heading>
          </CardHeader>
          <CardBody p={0}>
            <Table>
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Learner</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th isNumeric>Price</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(recentLessons || []).map((lesson: any) => (
                  <Tr key={lesson._id}>
                    <Td fontSize="sm">
                      {format(new Date(lesson.startTime), "dd MMM yyyy, HH:mm")}
                    </Td>
                    <Td>
                      <Text fontWeight="medium">
                        {lesson.learnerId?.firstName} {lesson.learnerId?.lastName}
                      </Text>
                    </Td>
                    <Td textTransform="capitalize">{lesson.type || "standard"}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          lesson.status === "completed" ? "green"
                            : lesson.status === "scheduled" ? "blue"
                            : lesson.status === "cancelled" ? "red"
                            : "gray"
                        }
                        textTransform="capitalize"
                      >
                        {lesson.status}
                      </Badge>
                    </Td>
                    <Td isNumeric>{formatGBP(lesson.price ?? 0)}</Td>
                  </Tr>
                ))}
                {(!recentLessons || recentLessons.length === 0) && (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={8}>
                      <Text color="text.muted">No lessons yet.</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
