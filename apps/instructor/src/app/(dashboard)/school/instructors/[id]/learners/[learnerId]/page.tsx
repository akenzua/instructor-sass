"use client";

import { useParams } from "next/navigation";
import {
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
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useMySchool, useSchoolInstructorLearnerDetail } from "@/hooks/queries";

function formatGBP(amount: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount / 100);
}

export default function SchoolLearnerDetailPage() {
  const params = useParams();
  const instructorId = params.id as string;
  const learnerId = params.learnerId as string;
  const { data: school, isLoading: schoolLoading } = useMySchool();
  const schoolId = school?._id || "";
  const { data, isLoading } = useSchoolInstructorLearnerDetail(schoolId, instructorId, learnerId);

  if (schoolLoading || isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!data?.learner) {
    return <Text>Learner not found.</Text>;
  }

  const { learner, link, lessons, progress } = data;

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Button
            as={Link}
            href={`/school/instructors/${instructorId}`}
            leftIcon={<ArrowLeft size={16} />}
            variant="ghost"
            size="sm"
          >
            Back to Instructor
          </Button>
        </HStack>

        <VStack align="start" spacing={1}>
          <Heading size="lg">
            {learner.firstName} {learner.lastName}
          </Heading>
          <HStack>
            <Text color="text.muted">{learner.email}</Text>
            {learner.phone && <Text color="text.muted">• {learner.phone}</Text>}
            <Badge
              colorScheme={link.status === "active" ? "green" : link.status === "paused" ? "yellow" : "gray"}
              textTransform="capitalize"
            >
              {link.status}
            </Badge>
            {link.testReadiness && (
              <Badge
                colorScheme={
                  link.testReadiness === "test-ready" ? "green"
                    : link.testReadiness === "nearly-ready" ? "yellow"
                    : "gray"
                }
                textTransform="capitalize"
              >
                {link.testReadiness.replace("-", " ")}
              </Badge>
            )}
          </HStack>
        </VStack>

        {/* Stats */}
        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Lessons</StatLabel>
                <StatNumber>{link.totalLessons}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Completed</StatLabel>
                <StatNumber>{link.completedLessons}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Cancelled</StatLabel>
                <StatNumber>{link.cancelledLessons}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Spent</StatLabel>
                <StatNumber>{formatGBP(link.totalSpent)}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Started</StatLabel>
                <StatNumber fontSize="md">
                  {link.startedAt ? format(new Date(link.startedAt), "dd MMM yyyy") : "—"}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Syllabus Progress */}
        {progress && progress.length > 0 && progress.map((prog: any) => {
          const topics = prog.topicProgress || [];
          const syllabus = prog.syllabusId;
          const syllabusTopics = syllabus?.topics || [];
          const completed = topics.filter((t: any) => t.status === "completed").length;
          const inProgress = topics.filter((t: any) => t.status === "in-progress").length;
          const totalTopics = syllabusTopics.length || topics.length;
          const progressPct = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;

          // Group topics by category
          const categories = new Map<string, any[]>();
          for (const st of syllabusTopics) {
            const cat = st.category || "Uncategorised";
            if (!categories.has(cat)) categories.set(cat, []);
            const tp = topics.find((t: any) => t.topicOrder === st.order);
            categories.get(cat)!.push({ ...st, progress: tp });
          }

          return (
            <Card key={prog._id}>
              <CardHeader>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <GraduationCap size={20} />
                    <Heading size="md">{syllabus?.name || "Syllabus Progress"}</Heading>
                  </HStack>
                  <HStack spacing={4} w="100%">
                    <Progress value={progressPct} size="sm" flex={1} colorScheme={progressPct >= 80 ? "green" : progressPct >= 40 ? "blue" : "gray"} borderRadius="full" />
                    <Text fontSize="sm" fontWeight="medium" whiteSpace="nowrap">
                      {completed}/{totalTopics} topics ({progressPct}%)
                    </Text>
                  </HStack>
                  <HStack spacing={4}>
                    <Badge colorScheme="green">{completed} Completed</Badge>
                    <Badge colorScheme="blue">{inProgress} In Progress</Badge>
                    <Badge colorScheme="gray">{totalTopics - completed - inProgress} Not Started</Badge>
                  </HStack>
                </VStack>
              </CardHeader>
              <CardBody p={0}>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>#</Th>
                      <Th>Topic</Th>
                      <Th>Status</Th>
                      <Th isNumeric>Score</Th>
                      <Th isNumeric>Attempts</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Array.from(categories.entries()).map(([category, items]) => (
                      <>
                        <Tr key={category}>
                          <Td colSpan={5} bg="bg.subtle" py={2}>
                            <Text fontWeight="semibold" fontSize="xs" textTransform="uppercase" color="text.muted">
                              {category}
                            </Text>
                          </Td>
                        </Tr>
                        {items.map((item: any) => {
                          const tp = item.progress;
                          return (
                            <Tr key={item.order}>
                              <Td fontSize="sm" color="text.muted">{item.order}</Td>
                              <Td fontSize="sm">{item.title}</Td>
                              <Td>
                                <Badge
                                  size="sm"
                                  colorScheme={
                                    tp?.status === "completed" ? "green"
                                      : tp?.status === "in-progress" ? "blue"
                                      : "gray"
                                  }
                                  textTransform="capitalize"
                                >
                                  {tp?.status || "not started"}
                                </Badge>
                              </Td>
                              <Td isNumeric>
                                {tp?.currentScore ? (
                                  <Text fontWeight="medium">{tp.currentScore}/5</Text>
                                ) : (
                                  <Text color="text.muted">—</Text>
                                )}
                              </Td>
                              <Td isNumeric>{tp?.attempts || 0}</Td>
                            </Tr>
                          );
                        })}
                      </>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          );
        })}

        {(!progress || progress.length === 0) && (
          <Card>
            <CardBody textAlign="center" py={8}>
              <GraduationCap size={32} style={{ margin: "0 auto 8px" }} />
              <Text color="text.muted">No syllabus progress recorded yet.</Text>
            </CardBody>
          </Card>
        )}

        {/* Lesson History */}
        <Card>
          <CardHeader>
            <HStack>
              <BookOpen size={20} />
              <Heading size="md">Lesson History ({lessons?.length || 0})</Heading>
            </HStack>
          </CardHeader>
          <CardBody p={0}>
            {!lessons || lessons.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Text color="text.muted">No lessons yet.</Text>
              </Box>
            ) : (
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Type</Th>
                    <Th>Duration</Th>
                    <Th>Topic Covered</Th>
                    <Th>Score</Th>
                    <Th>Status</Th>
                    <Th isNumeric>Price</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {lessons.map((lesson: any) => (
                    <Tr key={lesson._id}>
                      <Td fontSize="sm">
                        {format(new Date(lesson.startTime), "dd MMM yyyy, HH:mm")}
                      </Td>
                      <Td textTransform="capitalize" fontSize="sm">{lesson.type || "standard"}</Td>
                      <Td fontSize="sm">{lesson.duration} min</Td>
                      <Td fontSize="sm">{lesson.topicTitle || "—"}</Td>
                      <Td fontSize="sm">
                        {lesson.topicScore ? (
                          <Badge colorScheme={lesson.topicScore >= 4 ? "green" : lesson.topicScore >= 3 ? "yellow" : "red"}>
                            {lesson.topicScore}/5
                          </Badge>
                        ) : "—"}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            lesson.status === "completed" ? "green"
                              : lesson.status === "scheduled" ? "blue"
                              : lesson.status === "cancelled" ? "red"
                              : "gray"
                          }
                          textTransform="capitalize"
                          fontSize="xs"
                        >
                          {lesson.status}
                        </Badge>
                      </Td>
                      <Td isNumeric fontSize="sm">{formatGBP(lesson.price ?? 0)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
