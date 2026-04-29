"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Grid,
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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  Switch,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useMySchool } from "@/hooks/queries";
import { useSchoolPackages } from "@/hooks/queries";
import {
  useCreateSchoolPackage,
  useUpdateSchoolPackage,
  useDeleteSchoolPackage,
} from "@/hooks/mutations";

interface PackageFormData {
  name: string;
  description: string;
  lessonCount: number;
  price: number;
  discountPercent: number;
  isActive: boolean;
}

const initialFormData: PackageFormData = {
  name: "",
  description: "",
  lessonCount: 5,
  price: 200,
  discountPercent: 0,
  isActive: true,
};

export default function SchoolPackagesPage() {
  const { data: school, isLoading: schoolLoading } = useMySchool();
  const schoolId = school?._id || "";
  const { data: packages, isLoading: packagesLoading } = useSchoolPackages(schoolId);
  const createMutation = useCreateSchoolPackage();
  const updateMutation = useUpdateSchoolPackage();
  const deleteMutation = useDeleteSchoolPackage();
  const toast = useToast();
  const modal = useDisclosure();
  const deleteModal = useDisclosure();

  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [deletingPackage, setDeletingPackage] = useState<any>(null);
  const [formData, setFormData] = useState<PackageFormData>(initialFormData);

  if (schoolLoading || packagesLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  const openCreateModal = () => {
    setEditingPackage(null);
    setFormData(initialFormData);
    modal.onOpen();
  };

  const openEditModal = (pkg: any) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      lessonCount: pkg.lessonCount,
      price: pkg.price,
      discountPercent: pkg.discountPercent,
      isActive: pkg.isActive,
    });
    modal.onOpen();
  };

  const handleSave = () => {
    if (editingPackage) {
      updateMutation.mutate(
        { schoolId, packageId: editingPackage._id, data: formData },
        {
          onSuccess: () => {
            toast({ title: "Package updated", status: "success" });
            modal.onClose();
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
          },
        },
      );
    } else {
      createMutation.mutate(
        { schoolId, data: formData },
        {
          onSuccess: () => {
            toast({ title: "Package created", status: "success" });
            modal.onClose();
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
          },
        },
      );
    }
  };

  const handleDelete = () => {
    if (!deletingPackage) return;
    deleteMutation.mutate(
      { schoolId, packageId: deletingPackage._id },
      {
        onSuccess: () => {
          toast({ title: "Package deleted", status: "success" });
          deleteModal.onClose();
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
        },
      },
    );
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">School Packages</Heading>
        <Button leftIcon={<Plus size={18} />} colorScheme="primary" onClick={openCreateModal}>
          Create Package
        </Button>
      </HStack>

      <Text color="text.muted" mb={4}>
        Packages defined here are available to all instructors in the school.
      </Text>

      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
        {(packages || []).map((pkg: any) => (
          <Card key={pkg._id}>
            <CardBody>
              <HStack justify="space-between" mb={2}>
                <Heading size="sm">{pkg.name}</Heading>
                <Badge colorScheme={pkg.isActive ? "green" : "gray"}>
                  {pkg.isActive ? "Active" : "Inactive"}
                </Badge>
              </HStack>
              {pkg.description && (
                <Text fontSize="sm" color="text.muted" mb={3}>
                  {pkg.description}
                </Text>
              )}
              <VStack spacing={1} align="stretch" fontSize="sm">
                <HStack justify="space-between">
                  <Text>Lessons</Text>
                  <Text fontWeight="medium">{pkg.lessonCount}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Price</Text>
                  <Text fontWeight="medium">£{(pkg.price / 100).toFixed(2)}</Text>
                </HStack>
                {pkg.discountPercent > 0 && (
                  <HStack justify="space-between">
                    <Text>Discount</Text>
                    <Text fontWeight="medium" color="green.500">{pkg.discountPercent}%</Text>
                  </HStack>
                )}
              </VStack>
              <HStack mt={4} justify="flex-end">
                <IconButton
                  aria-label="Edit"
                  icon={<Edit2 size={16} />}
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(pkg)}
                />
                <IconButton
                  aria-label="Delete"
                  icon={<Trash2 size={16} />}
                  variant="ghost"
                  colorScheme="red"
                  size="sm"
                  onClick={() => {
                    setDeletingPackage(pkg);
                    deleteModal.onOpen();
                  }}
                />
              </HStack>
            </CardBody>
          </Card>
        ))}
        {(!packages || packages.length === 0) && (
          <Card>
            <CardBody textAlign="center" py={8}>
              <Text color="text.muted">No school packages yet.</Text>
            </CardBody>
          </Card>
        )}
      </Grid>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingPackage ? "Edit Package" : "Create Package"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Starter Package"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Lesson Count</FormLabel>
                <NumberInput
                  min={1}
                  value={formData.lessonCount}
                  onChange={(_, v) => setFormData({ ...formData, lessonCount: v || 1 })}
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
                  value={formData.price}
                  onChange={(_, v) => setFormData({ ...formData, price: v || 0 })}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Discount %</FormLabel>
                <NumberInput
                  min={0}
                  max={100}
                  value={formData.discountPercent}
                  onChange={(_, v) => setFormData({ ...formData, discountPercent: v || 0 })}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Active</FormLabel>
                <Switch
                  isChecked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={modal.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              onClick={handleSave}
              isLoading={createMutation.isPending || updateMutation.isPending}
              isDisabled={!formData.name}
            >
              {editingPackage ? "Save" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Package</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete "{deletingPackage?.name}"?</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteModal.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
