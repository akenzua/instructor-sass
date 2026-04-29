"use client";

import {
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
  SimpleGrid,
  Spinner,
  Switch,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Car, Plus, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useMySchool, useVehicles, useSchoolInstructors } from "@/hooks/queries";
import {
  useCreateVehicle,
  useRemoveVehicle,
  useAssignVehicle,
  useUnassignVehicle,
} from "@/hooks/mutations";
import { useAuth } from "@/lib/auth";

export default function FleetPage() {
  const { instructor } = useAuth();
  const { data: school, isLoading: schoolLoading } = useMySchool();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { data: instructors } = useSchoolInstructors(school?._id || "");
  const createVehicle = useCreateVehicle();
  const removeVehicle = useRemoveVehicle();
  const assignVehicle = useAssignVehicle();
  const unassignVehicle = useUnassignVehicle();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAssignOpen,
    onOpen: onAssignOpen,
    onClose: onAssignClose,
  } = useDisclosure();
  const toast = useToast();

  const isAdmin =
    (instructor as any)?.role === "owner" || (instructor as any)?.role === "admin";

  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    registration: "",
    transmission: "manual",
    color: "",
    hasLearnerDualControls: true,
  });

  const [assignData, setAssignData] = useState({
    vehicleId: "",
    instructorId: "",
    isPrimary: false,
  });

  if (schoolLoading || vehiclesLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!school) {
    return <Text>No school found.</Text>;
  }

  const handleCreateVehicle = () => {
    createVehicle.mutate(
      {
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year,
        registration: newVehicle.registration,
        transmission: newVehicle.transmission,
        color: newVehicle.color || undefined,
        hasLearnerDualControls: newVehicle.hasLearnerDualControls,
      },
      {
        onSuccess: () => {
          toast({ title: "Vehicle added", status: "success" });
          onClose();
          setNewVehicle({
            make: "",
            model: "",
            year: new Date().getFullYear(),
            registration: "",
            transmission: "manual",
            color: "",
            hasLearnerDualControls: true,
          });
        },
        onError: (err: any) => {
          toast({
            title: "Error",
            description: err.response?.data?.message || "Failed to add vehicle",
            status: "error",
          });
        },
      }
    );
  };

  const handleRemoveVehicle = (id: string, name: string) => {
    if (!confirm(`Retire ${name}?`)) return;
    removeVehicle.mutate(id, {
      onSuccess: () => toast({ title: "Vehicle retired", status: "success" }),
      onError: (err: any) =>
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to retire vehicle",
          status: "error",
        }),
    });
  };

  const handleAssign = () => {
    assignVehicle.mutate(
      {
        vehicleId: assignData.vehicleId,
        instructorId: assignData.instructorId,
        isPrimary: assignData.isPrimary,
      },
      {
        onSuccess: () => {
          toast({ title: "Vehicle assigned", status: "success" });
          onAssignClose();
          setAssignData({ vehicleId: "", instructorId: "", isPrimary: false });
        },
        onError: (err: any) =>
          toast({
            title: "Error",
            description: err.response?.data?.message || "Failed to assign vehicle",
            status: "error",
          }),
      }
    );
  };

  const statusColor: Record<string, string> = {
    active: "green",
    maintenance: "orange",
    retired: "gray",
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Fleet</Heading>
        {isAdmin && (
          <HStack>
            <Button leftIcon={<UserPlus size={18} />} variant="outline" onClick={() => {
              if (vehicles?.length) {
                setAssignData({ ...assignData, vehicleId: vehicles[0]._id });
              }
              onAssignOpen();
            }}>
              Assign Vehicle
            </Button>
            <Button leftIcon={<Plus size={18} />} colorScheme="primary" onClick={onOpen}>
              Add Vehicle
            </Button>
          </HStack>
        )}
      </HStack>

      {(!vehicles || vehicles.length === 0) ? (
        <Card>
          <CardBody textAlign="center" py={12}>
            <VStack spacing={3}>
              <Car size={48} />
              <Heading size="md">No vehicles yet</Heading>
              <Text color="text.muted">Add your first vehicle to get started.</Text>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {vehicles.map((v: any) => (
            <Card key={v._id}>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Heading size="sm">
                      {v.make} {v.model}
                    </Heading>
                    <Badge colorScheme={statusColor[v.status] || "gray"} textTransform="capitalize">
                      {v.status}
                    </Badge>
                  </HStack>
                  <SimpleGrid columns={2} spacing={2} fontSize="sm">
                    <Box>
                      <Text color="text.muted">Registration</Text>
                      <Text fontWeight="semibold">{v.registration}</Text>
                    </Box>
                    <Box>
                      <Text color="text.muted">Year</Text>
                      <Text fontWeight="semibold">{v.year}</Text>
                    </Box>
                    <Box>
                      <Text color="text.muted">Transmission</Text>
                      <Text fontWeight="semibold" textTransform="capitalize">{v.transmission}</Text>
                    </Box>
                    <Box>
                      <Text color="text.muted">Dual Controls</Text>
                      <Text fontWeight="semibold">{v.hasLearnerDualControls ? "Yes" : "No"}</Text>
                    </Box>
                  </SimpleGrid>
                  {v.color && (
                    <Box fontSize="sm">
                      <Text color="text.muted">Color</Text>
                      <Text fontWeight="semibold">{v.color}</Text>
                    </Box>
                  )}
                  {v.assignments && v.assignments.length > 0 && (
                    <Box fontSize="sm">
                      <Text color="text.muted" mb={1}>Assigned to</Text>
                      {v.assignments.map((a: any) => (
                        <HStack key={a._id} justify="space-between">
                          <Text>
                            {a.instructorId?.firstName} {a.instructorId?.lastName}
                            {a.isPrimary && (
                              <Badge ml={2} size="sm" colorScheme="blue">Primary</Badge>
                            )}
                          </Text>
                          {isAdmin && (
                            <IconButton
                              aria-label="Unassign"
                              icon={<Trash2 size={14} />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() =>
                                unassignVehicle.mutate(
                                  { vehicleId: v._id, instructorId: a.instructorId?._id || a.instructorId },
                                  {
                                    onSuccess: () => toast({ title: "Unassigned", status: "success" }),
                                  }
                                )
                              }
                            />
                          )}
                        </HStack>
                      ))}
                    </Box>
                  )}
                  {isAdmin && v.status !== "retired" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleRemoveVehicle(v._id, `${v.make} ${v.model}`)}
                    >
                      Retire Vehicle
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Add Vehicle Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Vehicle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Make</FormLabel>
                <Input
                  value={newVehicle.make}
                  onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                  placeholder="e.g. Ford"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Model</FormLabel>
                <Input
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  placeholder="e.g. Fiesta"
                />
              </FormControl>
              <HStack w="full">
                <FormControl isRequired>
                  <FormLabel>Year</FormLabel>
                  <Input
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) || 2024 })
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Registration</FormLabel>
                  <Input
                    value={newVehicle.registration}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, registration: e.target.value.toUpperCase() })
                    }
                    placeholder="AB12 CDE"
                  />
                </FormControl>
              </HStack>
              <HStack w="full">
                <FormControl>
                  <FormLabel>Transmission</FormLabel>
                  <Select
                    value={newVehicle.transmission}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, transmission: e.target.value })
                    }
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Color</FormLabel>
                  <Input
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                    placeholder="e.g. White"
                  />
                </FormControl>
              </HStack>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Dual Controls</FormLabel>
                <Switch
                  isChecked={newVehicle.hasLearnerDualControls}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, hasLearnerDualControls: e.target.checked })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              isLoading={createVehicle.isPending}
              onClick={handleCreateVehicle}
              isDisabled={!newVehicle.make || !newVehicle.model || !newVehicle.registration}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal isOpen={isAssignOpen} onClose={onAssignClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Vehicle to Instructor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Vehicle</FormLabel>
                <Select
                  value={assignData.vehicleId}
                  onChange={(e) => setAssignData({ ...assignData, vehicleId: e.target.value })}
                >
                  <option value="">Select a vehicle</option>
                  {(vehicles || [])
                    .filter((v: any) => v.status === "active")
                    .map((v: any) => (
                      <option key={v._id} value={v._id}>
                        {v.make} {v.model} — {v.registration}
                      </option>
                    ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Instructor</FormLabel>
                <Select
                  value={assignData.instructorId}
                  onChange={(e) => setAssignData({ ...assignData, instructorId: e.target.value })}
                >
                  <option value="">Select an instructor</option>
                  {(instructors || []).map((inst: any) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.firstName} {inst.lastName}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Primary vehicle</FormLabel>
                <Switch
                  isChecked={assignData.isPrimary}
                  onChange={(e) => setAssignData({ ...assignData, isPrimary: e.target.checked })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAssignClose}>
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              isLoading={assignVehicle.isPending}
              onClick={handleAssign}
              isDisabled={!assignData.vehicleId || !assignData.instructorId}
            >
              Assign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
