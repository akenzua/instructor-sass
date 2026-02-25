"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Skeleton,
  SkeletonText,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
  Badge,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { LessonCard } from "@acme/ui";
import { useLearner, useLessons, useDeleteLearner, useUpdateLearner } from "@/hooks";
import { LessonDrawer } from "@/components";
import type { Lesson } from "@acme/shared";

export default function LearnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const drawer = useDisclosure();
  const deleteDialog = useDisclosure();
  const editModal = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    licenseNumber: "",
    testDate: "",
    notes: "",
    status: "active" as "active" | "inactive" | "archived",
    addressLine1: "",
    addressLine2: "",
    addressCity: "",
    addressPostcode: "",
  });

  const learnerId = params.id as string;

  const { data: learner, isLoading: learnerLoading } = useLearner(learnerId);
  const { data: lessonsData, isLoading: lessonsLoading } = useLessons({
    learnerId,
    limit: 50,
  });
  const deleteMutation = useDeleteLearner();
  const updateMutation = useUpdateLearner();

  // Populate edit form when learner loads or edit modal opens
  useEffect(() => {
    if (learner && editModal.isOpen) {
      setEditForm({
        firstName: learner.firstName || "",
        lastName: learner.lastName || "",
        email: learner.email || "",
        phone: learner.phone || "",
        dateOfBirth: learner.dateOfBirth
          ? learner.dateOfBirth.split("T")[0]
          : "",
        licenseNumber: learner.licenseNumber || "",
        testDate: learner.testDate ? learner.testDate.split("T")[0] : "",
        notes: learner.notes || "",
        status: (learner.status as "active" | "inactive" | "archived") || "active",
        addressLine1: learner.address?.line1 || "",
        addressLine2: learner.address?.line2 || "",
        addressCity: learner.address?.city || "",
        addressPostcode: learner.address?.postcode || "",
      });
    }
  }, [learner, editModal.isOpen]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(learnerId);
      deleteDialog.onClose();
      toast({
        title: "Learner deleted",
        status: "success",
        duration: 3000,
      });
      router.push("/learners");
    } catch (error) {
      toast({
        title: "Failed to delete learner",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleEditSave = async () => {
    try {
      const data: Record<string, unknown> = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        status: editForm.status,
      };

      if (editForm.phone.trim()) data.phone = editForm.phone.trim();
      if (editForm.dateOfBirth) data.dateOfBirth = editForm.dateOfBirth;
      if (editForm.licenseNumber.trim()) data.licenseNumber = editForm.licenseNumber.trim();
      if (editForm.testDate) data.testDate = new Date(editForm.testDate).toISOString();
      if (editForm.notes.trim()) data.notes = editForm.notes.trim();

      const hasAddress =
        editForm.addressLine1.trim() ||
        editForm.addressLine2.trim() ||
        editForm.addressCity.trim() ||
        editForm.addressPostcode.trim();
      if (hasAddress) {
        data.address = {
          line1: editForm.addressLine1.trim(),
          line2: editForm.addressLine2.trim(),
          city: editForm.addressCity.trim(),
          postcode: editForm.addressPostcode.trim(),
        };
      }

      await updateMutation.mutateAsync({ id: learnerId, data: data as any });
      editModal.onClose();
      toast({
        title: "Learner updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to update learner",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    drawer.onOpen();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const upcomingLessons =
    lessonsData?.items.filter((l) => l.status === "scheduled") || [];
  const pastLessons =
    lessonsData?.items.filter((l) => l.status !== "scheduled") || [];

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Back Button */}
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => router.push("/learners")}
          alignSelf="flex-start"
        >
          Back to Learners
        </Button>

        {learnerLoading ? (
          <Card>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Skeleton height="32px" width="200px" />
                <SkeletonText noOfLines={3} spacing={2} width="300px" />
              </VStack>
            </CardBody>
          </Card>
        ) : learner ? (
          <>
            {/* Header Card */}
            <Card>
              <CardBody>
                <Grid
                  templateColumns={{ base: "1fr", md: "2fr 1fr" }}
                  gap={6}
                >
                  <GridItem>
                    <VStack align="start" spacing={4}>
                      <HStack spacing={4}>
                        <Heading size="lg">{learner.firstName} {learner.lastName}</Heading>
                        <Badge
                          colorScheme={
                            learner.status === "active"
                              ? "green"
                              : learner.status === "inactive"
                              ? "gray"
                              : "red"
                          }
                          fontSize="sm"
                        >
                          {learner.status}
                        </Badge>
                      </HStack>

                      <VStack align="start" spacing={2}>
                        <HStack color="text.muted">
                          <Mail size={16} />
                          <Text>{learner.email}</Text>
                        </HStack>
                        {learner.phone && (
                          <HStack color="text.muted">
                            <Phone size={16} />
                            <Text>{learner.phone}</Text>
                          </HStack>
                        )}
                        <HStack color="text.muted">
                          <Calendar size={16} />
                          <Text>
                            Member since{" "}
                            {format(new Date(learner.createdAt), "MMMM yyyy")}
                          </Text>
                        </HStack>
                      </VStack>

                      {learner.notes && (
                        <Box>
                          <Text fontSize="sm" color="text.muted" mb={1}>
                            Notes
                          </Text>
                          <Text>{learner.notes}</Text>
                        </Box>
                      )}
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <VStack align="stretch" spacing={4}>
                      <Box
                        p={4}
                        bg={
                          learner.balance < 0
                            ? "red.50"
                            : learner.balance > 0
                            ? "green.50"
                            : "gray.50"
                        }
                        borderRadius="lg"
                        _dark={{
                          bg:
                            learner.balance < 0
                              ? "red.900"
                              : learner.balance > 0
                              ? "green.900"
                              : "gray.700",
                        }}
                      >
                        <Text fontSize="sm" color="text.muted">
                          Current Balance
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color={
                            learner.balance < 0
                              ? "red.500"
                              : learner.balance > 0
                              ? "green.500"
                              : "text.default"
                          }
                        >
                          {formatCurrency(learner.balance)}
                        </Text>
                        <Text fontSize="xs" color="text.muted">
                          {learner.balance < 0
                            ? "Amount owed"
                            : learner.balance > 0
                            ? "Credit available"
                            : "No balance"}
                        </Text>
                      </Box>

                      <HStack spacing={2}>
                        <Button
                          flex={1}
                          leftIcon={<Edit size={16} />}
                          variant="outline"
                          onClick={editModal.onOpen}
                        >
                          Edit
                        </Button>
                        <IconButton
                          aria-label="Delete learner"
                          icon={<Trash2 size={16} />}
                          variant="outline"
                          colorScheme="red"
                          onClick={deleteDialog.onOpen}
                        />
                      </HStack>
                    </VStack>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>

            {/* Lessons Tabs */}
            <Card>
              <CardBody p={0}>
                <Tabs>
                  <TabList px={4}>
                    <Tab>
                      Upcoming ({upcomingLessons.length})
                    </Tab>
                    <Tab>
                      History ({pastLessons.length})
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      {lessonsLoading ? (
                        <VStack spacing={3}>
                          <Skeleton height="80px" width="100%" />
                          <Skeleton height="80px" width="100%" />
                        </VStack>
                      ) : upcomingLessons.length > 0 ? (
                        <VStack spacing={3} align="stretch">
                          {upcomingLessons.map((lesson) => (
                            <LessonCard
                              key={lesson._id}
                              learnerName={lesson.learner ? `${lesson.learner.firstName || ''} ${lesson.learner.lastName || ''}`.trim() : `${learner.firstName} ${learner.lastName}`}
                              type={lesson.type}
                              startTime={format(new Date(lesson.startTime), "h:mm a")}
                              endTime={format(new Date(lesson.endTime), "h:mm a")}
                              duration={lesson.duration}
                              status={lesson.status}
                              paymentStatus={lesson.paymentStatus}
                              price={lesson.price}
                              pickupLocation={lesson.pickupLocation}
                              onClick={() => handleLessonClick(lesson)}
                            />
                          ))}
                        </VStack>
                      ) : (
                        <Box py={8} textAlign="center">
                          <Text color="text.muted">
                            No upcoming lessons scheduled
                          </Text>
                          <Button mt={4} colorScheme="primary" size="sm">
                            Schedule Lesson
                          </Button>
                        </Box>
                      )}
                    </TabPanel>

                    <TabPanel>
                      {lessonsLoading ? (
                        <VStack spacing={3}>
                          <Skeleton height="80px" width="100%" />
                          <Skeleton height="80px" width="100%" />
                        </VStack>
                      ) : pastLessons.length > 0 ? (
                        <VStack spacing={3} align="stretch">
                          {pastLessons.map((lesson) => (
                            <LessonCard
                              key={lesson._id}
                              learnerName={lesson.learner ? `${lesson.learner.firstName || ''} ${lesson.learner.lastName || ''}`.trim() : `${learner.firstName} ${learner.lastName}`}
                              type={lesson.type}
                              startTime={format(new Date(lesson.startTime), "h:mm a")}
                              endTime={format(new Date(lesson.endTime), "h:mm a")}
                              duration={lesson.duration}
                              status={lesson.status}
                              paymentStatus={lesson.paymentStatus}
                              price={lesson.price}
                              pickupLocation={lesson.pickupLocation}
                              onClick={() => handleLessonClick(lesson)}
                            />
                          ))}
                        </VStack>
                      ) : (
                        <Box py={8} textAlign="center">
                          <Text color="text.muted">No lesson history yet</Text>
                        </Box>
                      )}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </>
        ) : (
          <Card>
            <CardBody>
              <Text>Learner not found</Text>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Lesson Drawer */}
      <LessonDrawer
        lesson={selectedLesson}
        isOpen={drawer.isOpen}
        onClose={() => {
          drawer.onClose();
          setSelectedLesson(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteDialog.onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Learner
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="semibold">
                {learner?.firstName} {learner?.lastName}
              </Text>
              ? This will permanently remove their profile and cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteDialog.onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Edit Learner Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Learner</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">First Name</FormLabel>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Last Name</FormLabel>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Email</FormLabel>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Phone</FormLabel>
                  <Input
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Status</FormLabel>
                  <Select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as "active" | "inactive" | "archived",
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Date of Birth</FormLabel>
                  <Input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dateOfBirth: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Driving Test Date</FormLabel>
                  <Input
                    type="date"
                    value={editForm.testDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, testDate: e.target.value })
                    }
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel fontSize="sm">Licence Number</FormLabel>
                <Input
                  placeholder="e.g. JONES910250J93CW"
                  value={editForm.licenseNumber}
                  maxLength={16}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      licenseNumber: e.target.value.toUpperCase(),
                    })
                  }
                />
              </FormControl>

              <Text fontSize="sm" fontWeight="medium" w="full" pt={2}>
                Address
              </Text>

              <FormControl>
                <FormLabel fontSize="sm">Address Line 1</FormLabel>
                <Input
                  value={editForm.addressLine1}
                  onChange={(e) =>
                    setEditForm({ ...editForm, addressLine1: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Address Line 2</FormLabel>
                <Input
                  value={editForm.addressLine2}
                  onChange={(e) =>
                    setEditForm({ ...editForm, addressLine2: e.target.value })
                  }
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm">City</FormLabel>
                  <Input
                    value={editForm.addressCity}
                    onChange={(e) =>
                      setEditForm({ ...editForm, addressCity: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Postcode</FormLabel>
                  <Input
                    value={editForm.addressPostcode}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        addressPostcode: e.target.value,
                      })
                    }
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel fontSize="sm">Notes</FormLabel>
                <Textarea
                  value={editForm.notes}
                  rows={3}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  placeholder="Any notes about this learner..."
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={editModal.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              onClick={handleEditSave}
              isLoading={updateMutation.isPending}
              isDisabled={
                !editForm.firstName.trim() ||
                !editForm.lastName.trim() ||
                !editForm.email.trim()
              }
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
