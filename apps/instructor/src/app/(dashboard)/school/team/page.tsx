"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  HStack,
  Heading,
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
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { Trash2, Mail, X } from "lucide-react";
import { useState } from "react";
import { useMySchool, useSchoolInstructors, useSchoolInvitations } from "@/hooks/queries";
import {
  useInviteSchoolInstructor,
  useCancelSchoolInvitation,
  useRemoveSchoolInstructor,
} from "@/hooks/mutations";
import { useAuth } from "@/lib/auth";

export default function TeamPage() {
  const { instructor } = useAuth();
  const { data: school, isLoading: schoolLoading } = useMySchool();
  const schoolId = school?._id || "";
  const { data: instructors, isLoading: instructorsLoading } = useSchoolInstructors(schoolId);
  const { data: invitations } = useSchoolInvitations(schoolId);
  const inviteInstructor = useInviteSchoolInstructor();
  const cancelInvitation = useCancelSchoolInvitation();
  const removeInstructor = useRemoveSchoolInstructor();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [inviteData, setInviteData] = useState({
    email: "",
    role: "instructor",
  });

  const isOwner = (instructor as any)?.role === "owner";
  const isAdmin = (instructor as any)?.role === "admin" || isOwner;

  if (schoolLoading || instructorsLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!school) {
    return <Text>No school found.</Text>;
  }

  const handleInvite = () => {
    inviteInstructor.mutate(
      {
        schoolId: school._id,
        data: {
          email: inviteData.email,
          role: inviteData.role as "admin" | "instructor",
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Invitation sent!", status: "success" });
          onClose();
          setInviteData({ email: "", role: "instructor" });
        },
        onError: (err: any) => {
          toast({
            title: "Error",
            description: err.response?.data?.message || "Failed to send invitation",
            status: "error",
          });
        },
      }
    );
  };

  const handleCancelInvitation = (invitationId: string) => {
    cancelInvitation.mutate(
      { schoolId: school._id, invitationId },
      {
        onSuccess: () => toast({ title: "Invitation cancelled", status: "success" }),
        onError: (err: any) => {
          toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
        },
      }
    );
  };

  const handleRemoveInstructor = (instructorId: string, name: string) => {
    if (!confirm(`Remove ${name} from the school?`)) return;
    removeInstructor.mutate(
      { schoolId: school._id, instructorId },
      {
        onSuccess: () => toast({ title: "Instructor removed", status: "success" }),
        onError: (err: any) => {
          toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
        },
      }
    );
  };

  const roleBadgeColor: Record<string, string> = {
    owner: "purple",
    admin: "blue",
    instructor: "green",
  };

  const pendingInvitations = (invitations || []).filter((inv: any) => inv.status === "pending");

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Instructors</Heading>
        {isAdmin && (
          <Button leftIcon={<Mail size={18} />} colorScheme="primary" onClick={onOpen}>
            Invite Instructor
          </Button>
        )}
      </HStack>

      <Tabs>
        <TabList>
          <Tab>Members ({(instructors || []).length})</Tab>
          <Tab>Pending Invitations ({pendingInvitations.length})</Tab>
        </TabList>

        <TabPanels>
          {/* Members Tab */}
          <TabPanel px={0}>
            <Card>
              <CardBody p={0}>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Instructor</Th>
                      <Th>Email</Th>
                      <Th>Role</Th>
                      {isAdmin && <Th />}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(instructors || []).map((inst: any) => (
                      <Tr key={inst._id}>
                        <Td>
                          <HStack>
                            <Avatar size="sm" name={`${inst.firstName} ${inst.lastName}`} />
                            <Text fontWeight="medium">
                              {inst.firstName} {inst.lastName}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Text color="text.muted">{inst.email}</Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={roleBadgeColor[inst.role] || "gray"} textTransform="capitalize">
                            {inst.role}
                          </Badge>
                        </Td>
                        {isAdmin && (
                          <Td>
                            {inst.role !== "owner" && (
                              <IconButton
                                aria-label="Remove instructor"
                                icon={<Trash2 size={16} />}
                                variant="ghost"
                                colorScheme="red"
                                size="sm"
                                onClick={() =>
                                  handleRemoveInstructor(inst._id, `${inst.firstName} ${inst.lastName}`)
                                }
                              />
                            )}
                          </Td>
                        )}
                      </Tr>
                    ))}
                    {(!instructors || instructors.length === 0) && (
                      <Tr>
                        <Td colSpan={4} textAlign="center" py={8}>
                          <Text color="text.muted">No team members yet.</Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Invitations Tab */}
          <TabPanel px={0}>
            <Card>
              <CardBody p={0}>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Email</Th>
                      <Th>Role</Th>
                      <Th>Status</Th>
                      <Th>Sent</Th>
                      {isAdmin && <Th />}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(invitations || []).map((inv: any) => (
                      <Tr key={inv._id}>
                        <Td>
                          <Text fontWeight="medium">{inv.email}</Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={roleBadgeColor[inv.role] || "gray"} textTransform="capitalize">
                            {inv.role}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={inv.status === "pending" ? "yellow" : inv.status === "accepted" ? "green" : "gray"}
                            textTransform="capitalize"
                          >
                            {inv.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </Text>
                        </Td>
                        {isAdmin && (
                          <Td>
                            {inv.status === "pending" && (
                              <IconButton
                                aria-label="Cancel invitation"
                                icon={<X size={16} />}
                                variant="ghost"
                                colorScheme="red"
                                size="sm"
                                onClick={() => handleCancelInvitation(inv._id)}
                              />
                            )}
                          </Td>
                        )}
                      </Tr>
                    ))}
                    {(!invitations || invitations.length === 0) && (
                      <Tr>
                        <Td colSpan={5} textAlign="center" py={8}>
                          <Text color="text.muted">No invitations sent yet.</Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Invite Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite Instructor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="instructor@email.com"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                >
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormControl>
              <Text fontSize="sm" color="text.muted">
                An email invitation will be sent. They can accept with an existing account or create a new one.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              onClick={handleInvite}
              isLoading={inviteInstructor.isPending}
              isDisabled={!inviteData.email}
            >
              Send Invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
