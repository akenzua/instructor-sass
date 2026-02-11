"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Skeleton,
  Switch,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@acme/ui";
import { usePackages } from "@/hooks";
import { useCreatePackage, useUpdatePackage, useDeletePackage } from "@/hooks/mutations";
import type { Package } from "@/lib/api";
import { useAuth } from "@/lib/auth";

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

export default function PackagesPage() {
  const toast = useToast();
  const modal = useDisclosure();
  const deleteModal = useDisclosure();
  const { instructor } = useAuth();

  const { data: packages, isLoading: packagesLoading, error: packagesError } = usePackages();
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();
  const deleteMutation = useDeletePackage();

  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(initialFormData);

  const openCreateModal = () => {
    setEditingPackage(null);
    setFormData(initialFormData);
    modal.onOpen();
  };

  const openEditModal = (pkg: Package) => {
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

  const openDeleteModal = (pkg: Package) => {
    setDeletingPackage(pkg);
    deleteModal.onOpen();
  };

  const handleSubmit = async () => {
    try {
      if (editingPackage) {
        await updateMutation.mutateAsync({
          id: editingPackage._id,
          data: formData,
        });
        toast({
          title: "Package updated",
          status: "success",
          duration: 3000,
        });
      } else {
        await createMutation.mutateAsync(formData);
        toast({
          title: "Package created",
          status: "success",
          duration: 3000,
        });
      }
      modal.onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save package. Please try again.",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingPackage) return;

    try {
      await deleteMutation.mutateAsync(deletingPackage._id);
      toast({
        title: "Package deleted",
        status: "success",
        duration: 3000,
      });
      deleteModal.onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete package. Please try again.",
        status: "error",
        duration: 5000,
      });
    }
  };

  const calculateDiscountedPrice = () => {
    const discount = formData.price * (formData.discountPercent / 100);
    return formData.price - discount;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);

  return (
    <>
      <VStack spacing={6} align="stretch">
        <PageHeader
          title="Packages"
          description="Create and manage lesson packages for your learners"
          actions={
            <Button
              leftIcon={<Plus size={16} />}
              colorScheme="primary"
              onClick={openCreateModal}
            >
              Create Package
            </Button>
          }
        />

        {packagesLoading ? (
          <Skeleton height="400px" borderRadius="lg" />
        ) : packages && packages.length > 0 ? (
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={4}
          >
            {packages.map((pkg) => (
              <GridItem key={pkg._id}>
                <Card
                  bg="bg.surface"
                  border="1px solid"
                  borderColor={pkg.isActive ? "border.subtle" : "border.subtle"}
                  opacity={pkg.isActive ? 1 : 0.7}
                >
                  <CardHeader pb={2}>
                    <Flex justify="space-between" align="flex-start">
                      <Box>
                        <Heading size="sm">{pkg.name}</Heading>
                        {!pkg.isActive && (
                          <Box
                            as="span"
                            px={2}
                            py={0.5}
                            mt={1}
                            display="inline-block"
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="medium"
                            bg="gray.100"
                            color="gray.600"
                          >
                            Inactive
                          </Box>
                        )}
                      </Box>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Edit package"
                          icon={<Edit2 size={14} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(pkg)}
                        />
                        <IconButton
                          aria-label="Delete package"
                          icon={<Trash2 size={14} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => openDeleteModal(pkg)}
                        />
                      </HStack>
                    </Flex>
                  </CardHeader>
                  <CardBody pt={2}>
                    <VStack align="stretch" spacing={3}>
                      {pkg.description && (
                        <Text fontSize="sm" color="fg.muted">
                          {pkg.description}
                        </Text>
                      )}
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="fg.muted">
                          Lessons:
                        </Text>
                        <Text fontWeight="semibold">{pkg.lessonCount}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="fg.muted">
                          Price:
                        </Text>
                        <VStack align="flex-end" spacing={0}>
                          {pkg.discountPercent > 0 ? (
                            <>
                              <Text fontSize="sm" textDecoration="line-through" color="fg.muted">
                                {formatCurrency(pkg.price)}
                              </Text>
                              <Text fontWeight="bold" color="green.500">
                                {formatCurrency(pkg.price * (1 - pkg.discountPercent / 100))}
                              </Text>
                            </>
                          ) : (
                            <Text fontWeight="bold">{formatCurrency(pkg.price)}</Text>
                          )}
                        </VStack>
                      </HStack>
                      {pkg.discountPercent > 0 && (
                        <Box
                          as="span"
                          px={2}
                          py={1}
                          borderRadius="md"
                          fontSize="xs"
                          fontWeight="medium"
                          bg="green.100"
                          color="green.800"
                          textAlign="center"
                        >
                          {pkg.discountPercent}% discount
                        </Box>
                      )}
                      <Text fontSize="xs" color="fg.muted">
                        {formatCurrency(
                          (pkg.price * (1 - pkg.discountPercent / 100)) / pkg.lessonCount
                        )}{" "}
                        per lesson
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        ) : (
          <Card bg="bg.surface" border="1px solid" borderColor="border.subtle">
            <CardBody py={12}>
              <VStack spacing={4}>
                <Text color="fg.muted">No packages yet</Text>
                <Text fontSize="sm" color="fg.muted" textAlign="center">
                  Create lesson packages to offer bundle discounts to your learners.
                </Text>
                <Button
                  leftIcon={<Plus size={16} />}
                  colorScheme="primary"
                  onClick={openCreateModal}
                >
                  Create Your First Package
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal.isOpen} onClose={modal.onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingPackage ? "Edit Package" : "Create Package"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Package Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., 10-Lesson Bundle"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Optional description for this package"
                  rows={3}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Number of Lessons</FormLabel>
                <NumberInput
                  value={formData.lessonCount}
                  onChange={(_, value) =>
                    setFormData((prev) => ({ ...prev, lessonCount: value || 1 }))
                  }
                  min={1}
                  max={100}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Total Price (£)</FormLabel>
                <NumberInput
                  value={formData.price}
                  onChange={(_, value) =>
                    setFormData((prev) => ({ ...prev, price: value || 0 }))
                  }
                  min={0}
                  precision={2}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Discount (%)</FormLabel>
                <NumberInput
                  value={formData.discountPercent}
                  onChange={(_, value) =>
                    setFormData((prev) => ({ ...prev, discountPercent: value || 0 }))
                  }
                  min={0}
                  max={100}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              {formData.discountPercent > 0 && (
                <Box
                  w="full"
                  p={3}
                  bg="green.50"
                  borderRadius="md"
                  _dark={{ bg: "green.900" }}
                >
                  <Text fontSize="sm" color="green.700" _dark={{ color: "green.200" }}>
                    Final price: {formatCurrency(calculateDiscountedPrice())} (
                    {formatCurrency(calculateDiscountedPrice() / formData.lessonCount)} per
                    lesson)
                  </Text>
                </Box>
              )}

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb="0">Active</FormLabel>
                <Switch
                  colorScheme="primary"
                  isChecked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
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
              onClick={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              isDisabled={!formData.name || formData.lessonCount < 1 || formData.price < 0}
            >
              {editingPackage ? "Save Changes" : "Create Package"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Package</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="bold">
                {deletingPackage?.name}
              </Text>
              ? This action cannot be undone.
            </Text>
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
    </>
  );
}
