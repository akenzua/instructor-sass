"use client";

import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/react";
import { useCreateLearner } from "@/hooks";

interface CreateLearnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export function CreateLearnerModal({ isOpen, onClose }: CreateLearnerModalProps) {
  const toast = useToast();
  const createMutation = useCreateLearner();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
        status: "active",
      });

      toast({
        title: "Learner created",
        description: `${formData.firstName} ${formData.lastName} has been added successfully`,
        status: "success",
        duration: 3000,
      });

      // Reset form and close
      setFormData({ firstName: "", lastName: "", email: "", phone: "", notes: "" });
      setErrors({});
      onClose();
    } catch (error) {
      toast({
        title: "Failed to create learner",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleClose = () => {
    setFormData({ firstName: "", lastName: "", email: "", phone: "", notes: "" });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Learner</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={!!errors.firstName}>
              <FormLabel>First Name</FormLabel>
              <Input
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <FormErrorMessage>{errors.firstName}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.lastName}>
              <FormLabel>Last Name</FormLabel>
              <Input
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              <FormErrorMessage>{errors.lastName}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Phone</FormLabel>
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea
                placeholder="Any additional notes about this learner..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
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
            isLoading={createMutation.isPending}
          >
            Add Learner
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
