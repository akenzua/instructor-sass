"use client";

import { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Portal,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Box,
  Badge,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { publicApi, type PublicInstructor } from "@/lib/api";
import type { Package } from "@acme/shared";

interface PackagePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: PublicInstructor;
  package: Package;
}

interface PurchaseFormData {
  learnerEmail: string;
  learnerFirstName: string;
  learnerLastName: string;
  learnerPhone: string;
}

export function PackagePurchaseModal({
  isOpen,
  onClose,
  instructor,
  package: pkg,
}: PackagePurchaseModalProps) {
  const toast = useToast();
  const [formData, setFormData] = useState<PurchaseFormData>({
    learnerEmail: "",
    learnerFirstName: "",
    learnerLastName: "",
    learnerPhone: "",
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: () =>
      publicApi.purchasePackage(instructor.username, {
        packageId: pkg._id,
        learnerEmail: formData.learnerEmail,
        learnerFirstName: formData.learnerFirstName,
        learnerLastName: formData.learnerLastName,
        learnerPhone: formData.learnerPhone || undefined,
      }),
    onSuccess: (data: { paymentUrl?: string }) => {
      toast({
        title: "Order created!",
        description: "Redirecting to payment...",
        status: "success",
        duration: 3000,
      });
      // Redirect to payment URL
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        onClose();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Please try again",
        status: "error",
        duration: 5000,
      });
    },
  });

  const handleSubmit = () => {
    // Basic validation
    if (!formData.learnerEmail || !formData.learnerFirstName || !formData.learnerLastName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    purchaseMutation.mutate();
  };

  const handleClose = () => {
    setFormData({
      learnerEmail: "",
      learnerFirstName: "",
      learnerLastName: "",
      learnerPhone: "",
    });
    onClose();
  };

  // Calculate original price and savings
  const pricePerLesson = pkg.price / pkg.lessonCount;
  const originalPrice = instructor.lessonTypes?.[0]
    ? instructor.lessonTypes[0].price * pkg.lessonCount
    : pkg.price;
  const savings = originalPrice - pkg.price;

  return (
    <Portal>
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        size="md" 
        isCentered 
        scrollBehavior="inside"
        blockScrollOnMount={true}
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent mx={4} maxH="90vh">
          <ModalHeader>Purchase Package</ModalHeader>
          <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Package Summary */}
            <Box
              p={4}
              bg={pkg.discountPercent > 0 ? "green.50" : "gray.50"}
              borderRadius="md"
              border="1px solid"
              borderColor={pkg.discountPercent > 0 ? "green.200" : "gray.200"}
            >
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="lg">
                    {pkg.name}
                  </Text>
                  {pkg.discountPercent > 0 && (
                    <Badge colorScheme="green" fontSize="sm">
                      {pkg.discountPercent}% OFF
                    </Badge>
                  )}
                </HStack>

                {pkg.description && (
                  <Text color="gray.600" fontSize="sm">
                    {pkg.description}
                  </Text>
                )}

                <Divider />

                <VStack align="stretch" spacing={1}>
                  <HStack justify="space-between">
                    <Text color="gray.600">Number of lessons</Text>
                    <Text fontWeight="semibold">{pkg.lessonCount}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.600">Price per lesson</Text>
                    <Text fontWeight="semibold">£{pricePerLesson.toFixed(2)}</Text>
                  </HStack>
                  {savings > 0 && (
                    <HStack justify="space-between" color="green.600">
                      <Text>You save</Text>
                      <Text fontWeight="semibold">£{savings.toFixed(2)}</Text>
                    </HStack>
                  )}
                </VStack>

                <Divider />

                <HStack justify="space-between">
                  <Text fontWeight="bold">Total</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="primary.500">
                    £{pkg.price}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Contact Details */}
            <Text fontWeight="semibold" color="gray.500" fontSize="sm">
              YOUR DETAILS
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  value={formData.learnerFirstName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, learnerFirstName: e.target.value }))
                  }
                  placeholder="Your first name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  value={formData.learnerLastName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, learnerLastName: e.target.value }))
                  }
                  placeholder="Your last name"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={formData.learnerEmail}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, learnerEmail: e.target.value }))
                }
                placeholder="your@email.com"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Phone (optional)</FormLabel>
              <Input
                type="tel"
                value={formData.learnerPhone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, learnerPhone: e.target.value }))
                }
                placeholder="Your phone number"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="primary"
            onClick={handleSubmit}
            isLoading={purchaseMutation.isPending}
          >
            Pay £{pkg.price}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </Portal>
  );
}
