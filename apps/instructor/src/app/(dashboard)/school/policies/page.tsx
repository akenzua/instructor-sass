"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SimpleGrid,
  Spinner,
  Switch,
  Text,
  VStack,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useMySchool, useSchoolPolicies } from "@/hooks/queries";
import { useUpdateSchoolPolicies } from "@/hooks/mutations";

interface LessonType {
  name: string;
  duration: number;
  price: number;
  description?: string;
}

interface CancellationPolicy {
  hoursBeforeLesson: number;
  refundPercent: number;
  enabled: boolean;
}

export default function SchoolPoliciesPage() {
  const { data: school, isLoading: schoolLoading } = useMySchool();
  const schoolId = school?._id || "";
  const { data: policies, isLoading: policiesLoading } = useSchoolPolicies(schoolId);
  const updatePolicies = useUpdateSchoolPolicies();
  const toast = useToast();
  const lessonTypeModal = useDisclosure();

  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>({
    hoursBeforeLesson: 24,
    refundPercent: 100,
    enabled: false,
  });

  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [editingLessonType, setEditingLessonType] = useState<number | null>(null);
  const [lessonTypeForm, setLessonTypeForm] = useState<LessonType>({
    name: "",
    duration: 60,
    price: 3500,
    description: "",
  });

  useEffect(() => {
    if (policies) {
      if (policies.cancellationPolicy) {
        setCancellationPolicy(policies.cancellationPolicy);
      }
      if (policies.lessonTypes) {
        setLessonTypes(policies.lessonTypes);
      }
    }
  }, [policies]);

  if (schoolLoading || policiesLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  const saveCancellationPolicy = () => {
    updatePolicies.mutate(
      { schoolId, data: { cancellationPolicy } },
      {
        onSuccess: () => toast({ title: "Cancellation policy saved", status: "success" }),
        onError: (err: any) => {
          toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
        },
      },
    );
  };

  const openAddLessonType = () => {
    setEditingLessonType(null);
    setLessonTypeForm({ name: "", duration: 60, price: 3500, description: "" });
    lessonTypeModal.onOpen();
  };

  const openEditLessonType = (index: number) => {
    setEditingLessonType(index);
    setLessonTypeForm({ ...lessonTypes[index] });
    lessonTypeModal.onOpen();
  };

  const saveLessonType = () => {
    const updated = [...lessonTypes];
    if (editingLessonType !== null) {
      updated[editingLessonType] = lessonTypeForm;
    } else {
      updated.push(lessonTypeForm);
    }
    updatePolicies.mutate(
      { schoolId, data: { lessonTypes: updated } },
      {
        onSuccess: () => {
          setLessonTypes(updated);
          toast({ title: "Lesson types updated", status: "success" });
          lessonTypeModal.onClose();
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
        },
      },
    );
  };

  const removeLessonType = (index: number) => {
    const updated = lessonTypes.filter((_, i) => i !== index);
    updatePolicies.mutate(
      { schoolId, data: { lessonTypes: updated } },
      {
        onSuccess: () => {
          setLessonTypes(updated);
          toast({ title: "Lesson type removed", status: "success" });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
        },
      },
    );
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>School Policies</Heading>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Cancellation Policy */}
        <Card>
          <CardHeader>
            <Heading size="md">Cancellation Policy</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Enable cancellation policy</FormLabel>
                <Switch
                  isChecked={cancellationPolicy.enabled}
                  onChange={(e) =>
                    setCancellationPolicy({ ...cancellationPolicy, enabled: e.target.checked })
                  }
                />
              </FormControl>
              {cancellationPolicy.enabled && (
                <>
                  <FormControl>
                    <FormLabel>Hours before lesson</FormLabel>
                    <NumberInput
                      min={1}
                      max={168}
                      value={cancellationPolicy.hoursBeforeLesson}
                      onChange={(_, v) =>
                        setCancellationPolicy({ ...cancellationPolicy, hoursBeforeLesson: v || 24 })
                      }
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="xs" color="text.muted" mt={1}>
                      Cancellations within this window may be charged.
                    </Text>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Refund percentage</FormLabel>
                    <NumberInput
                      min={0}
                      max={100}
                      value={cancellationPolicy.refundPercent}
                      onChange={(_, v) =>
                        setCancellationPolicy({ ...cancellationPolicy, refundPercent: v || 0 })
                      }
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="xs" color="text.muted" mt={1}>
                      Refund given for late cancellations (0% = full charge).
                    </Text>
                  </FormControl>
                </>
              )}
              <Button
                colorScheme="primary"
                onClick={saveCancellationPolicy}
                isLoading={updatePolicies.isPending}
              >
                Save Policy
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Lesson Types */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Lesson Types</Heading>
              <Button leftIcon={<Plus size={16} />} size="sm" onClick={openAddLessonType}>
                Add Type
              </Button>
            </HStack>
          </CardHeader>
          <CardBody p={0}>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Duration</Th>
                  <Th>Price</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {lessonTypes.map((lt, i) => (
                  <Tr key={i}>
                    <Td fontWeight="medium">{lt.name}</Td>
                    <Td>{lt.duration} min</Td>
                    <Td>£{(lt.price / 100).toFixed(2)}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Edit"
                          icon={<Edit2 size={14} />}
                          variant="ghost"
                          size="xs"
                          onClick={() => openEditLessonType(i)}
                        />
                        <IconButton
                          aria-label="Remove"
                          icon={<Trash2 size={14} />}
                          variant="ghost"
                          colorScheme="red"
                          size="xs"
                          onClick={() => removeLessonType(i)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {lessonTypes.length === 0 && (
                  <Tr>
                    <Td colSpan={4} textAlign="center" py={6}>
                      <Text color="text.muted" fontSize="sm">No lesson types defined yet.</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Lesson Type Modal */}
      <Modal isOpen={lessonTypeModal.isOpen} onClose={lessonTypeModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingLessonType !== null ? "Edit Lesson Type" : "Add Lesson Type"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={lessonTypeForm.name}
                  onChange={(e) => setLessonTypeForm({ ...lessonTypeForm, name: e.target.value })}
                  placeholder="e.g. Standard Lesson"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Duration (minutes)</FormLabel>
                <NumberInput
                  min={15}
                  step={15}
                  value={lessonTypeForm.duration}
                  onChange={(_, v) => setLessonTypeForm({ ...lessonTypeForm, duration: v || 60 })}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Price (pence)</FormLabel>
                <NumberInput
                  min={0}
                  value={lessonTypeForm.price}
                  onChange={(_, v) => setLessonTypeForm({ ...lessonTypeForm, price: v || 0 })}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={lessonTypeForm.description || ""}
                  onChange={(e) => setLessonTypeForm({ ...lessonTypeForm, description: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={lessonTypeModal.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              onClick={saveLessonType}
              isLoading={updatePolicies.isPending}
              isDisabled={!lessonTypeForm.name}
            >
              {editingLessonType !== null ? "Save" : "Add"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
