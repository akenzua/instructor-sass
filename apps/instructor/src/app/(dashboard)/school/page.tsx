"use client";

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Switch,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useMySchool } from "@/hooks/queries";
import { useUpdateSchool, useUpdateInstructor } from "@/hooks/mutations";

export default function SchoolPage() {
  const { instructor } = useAuth();
  const { data: school, isLoading } = useMySchool();
  const updateSchool = useUpdateSchool();
  const updateInstructor = useUpdateInstructor();
  const toast = useToast();
  const isSchoolMember = !!(instructor as any)?.schoolId;
  const isAdmin = isSchoolMember && ["owner", "admin"].includes((instructor as any)?.role);

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!isSchoolMember || !school) {
    return <Text>No school found.</Text>;
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">School Settings</Heading>
        <SchoolDetails school={school} updateSchool={updateSchool} toast={toast} />
        {isAdmin && (
          <TeachingToggle
            instructor={instructor}
            updateInstructor={updateInstructor}
            toast={toast}
          />
        )}
      </VStack>
    </Box>
  );
}

function SchoolDetails({
  school,
  updateSchool,
  toast,
}: {
  school: any;
  updateSchool: any;
  toast: any;
}) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: school.name || "",
    email: school.email || "",
    phone: school.phone || "",
    businessRegistrationNumber: school.businessRegistrationNumber || "",
  });

  const handleSave = () => {
    updateSchool.mutate(
      { id: school._id, data: formData },
      {
        onSuccess: () => {
          toast({ title: "School updated", status: "success" });
          setEditing(false);
        },
        onError: (err: any) => {
          toast({
            title: "Error",
            description: err.response?.data?.message || "Failed to update",
            status: "error",
          });
        },
      }
    );
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      <Card>
        <CardHeader>
          <Heading size="md">School Information</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                value={formData.name}
                isReadOnly={!editing}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                value={formData.email}
                isReadOnly={!editing}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Phone</FormLabel>
              <Input
                value={formData.phone}
                isReadOnly={!editing}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Registration Number</FormLabel>
              <Input
                value={formData.businessRegistrationNumber}
                isReadOnly={!editing}
                onChange={(e) =>
                  setFormData({ ...formData, businessRegistrationNumber: e.target.value })
                }
              />
            </FormControl>
            {editing ? (
              <Box display="flex" gap={2}>
                <Button
                  colorScheme="primary"
                  isLoading={updateSchool.isPending}
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Heading size="md">Status</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <Box>
              <Text fontSize="sm" color="text.muted">Status</Text>
              <Text fontWeight="semibold" textTransform="capitalize">{school.status}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="text.muted">Owner</Text>
              <Text fontWeight="semibold">{school.ownerId?.firstName} {school.ownerId?.lastName}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="text.muted">Created</Text>
              <Text fontWeight="semibold">
                {new Date(school.createdAt).toLocaleDateString()}
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
}

function TeachingToggle({
  instructor,
  updateInstructor,
  toast,
}: {
  instructor: any;
  updateInstructor: any;
  toast: any;
}) {
  const isTeaching = !!(instructor as any)?.isTeaching;

  const handleToggle = () => {
    updateInstructor.mutate(
      { isTeaching: !isTeaching },
      {
        onSuccess: () => {
          toast({
            title: !isTeaching ? "Teaching enabled" : "Teaching disabled",
            description: !isTeaching
              ? "You can now manage lessons, learners, and your calendar."
              : "Instructor menu has been hidden. You can re-enable it anytime.",
            status: "success",
          });
          // Reload to update navigation
          window.location.reload();
        },
        onError: (err: any) => {
          toast({
            title: "Error",
            description: err.response?.data?.message || "Failed to update",
            status: "error",
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Teaching Mode</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={3} align="stretch">
          <Text fontSize="sm" color="text.muted">
            As a school administrator, you can also teach lessons yourself.
            Enable teaching mode to access the instructor dashboard, calendar,
            lessons, and learner management.
          </Text>
          <FormControl display="flex" alignItems="center" gap={3}>
            <Switch
              id="teaching-toggle"
              isChecked={isTeaching}
              onChange={handleToggle}
              colorScheme="primary"
              size="lg"
              isDisabled={updateInstructor.isPending}
            />
            <FormLabel htmlFor="teaching-toggle" mb={0} fontWeight="semibold">
              {isTeaching ? "Teaching enabled" : "Teaching disabled"}
            </FormLabel>
          </FormControl>
        </VStack>
      </CardBody>
    </Card>
  );
}
