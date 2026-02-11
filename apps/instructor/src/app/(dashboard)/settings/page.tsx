"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Textarea,
  Button,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  Divider,
  useToast,
  Spinner,
  Badge,
  Icon,
  SimpleGrid,
  Select,
  NumberInput,
  NumberInputField,
  Alert,
  AlertIcon,
  Link,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  Globe,
  User,
  Car,
  Settings,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUpdateInstructor, useCheckUsername } from "@/hooks/mutations";
import type { UpdateInstructorData } from "@/lib/api";

export default function SettingsPage() {
  const { instructor, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const updateMutation = useUpdateInstructor();
  const checkUsernameMutation = useCheckUsername();

  const [formData, setFormData] = useState<UpdateInstructorData>({});
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameDebounce, setUsernameDebounce] = useState<NodeJS.Timeout | null>(null);

  // Initialize form with instructor data
  useEffect(() => {
    if (instructor) {
      setFormData({
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        phone: instructor.phone || "",
        businessName: instructor.businessName || "",
        hourlyRate: instructor.hourlyRate,
        currency: instructor.currency,
        username: (instructor as any).username || "",
        bio: (instructor as any).bio || "",
        about: (instructor as any).about || "",
        primaryLocation: (instructor as any).primaryLocation || "",
        passRate: (instructor as any).passRate,
        yearsExperience: (instructor as any).yearsExperience,
        isPublicProfileEnabled: (instructor as any).isPublicProfileEnabled || false,
        showPricing: (instructor as any).showPricing ?? true,
        showAvailability: (instructor as any).showAvailability ?? true,
        acceptingNewStudents: (instructor as any).acceptingNewStudents ?? true,
        vehicleInfo: (instructor as any).vehicleInfo || {},
        socialLinks: (instructor as any).socialLinks || {},
        qualifications: (instructor as any).qualifications || [],
        languages: (instructor as any).languages || [],
        lessonTypes: (instructor as any).lessonTypes || [],
      });
      
      // Set initial username status
      if ((instructor as any).username) {
        setUsernameStatus("available");
      }
    }
  }, [instructor]);

  // Check username availability with debounce
  const handleUsernameChange = (value: string) => {
    const normalized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({ ...prev, username: normalized }));
    
    if (usernameDebounce) {
      clearTimeout(usernameDebounce);
    }

    if (!normalized || normalized.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    // Don't check if it's the same as current username
    if (normalized === (instructor as any)?.username) {
      setUsernameStatus("available");
      return;
    }

    setUsernameStatus("checking");
    const timeout = setTimeout(async () => {
      try {
        const result = await checkUsernameMutation.mutateAsync(normalized);
        setUsernameStatus(result.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);
    setUsernameDebounce(timeout);
  };

  const handleSubmit = async () => {
    if (usernameStatus === "taken") {
      toast({
        title: "Username taken",
        description: "Please choose a different username",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      await updateMutation.mutateAsync(formData);
      toast({
        title: "Settings saved",
        description: "Your profile has been updated",
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.response?.data?.message || "Please try again",
        status: "error",
        duration: 5000,
      });
    }
  };

  if (authLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Box textAlign="center" py={20}>
          <Spinner size="xl" />
        </Box>
      </Container>
    );
  }

  const publicProfileUrl = formData.username
    ? `https://${formData.username}.indrive.com`
    : null;

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg">Settings</Heading>
          <Text color="gray.600">Manage your account and public profile</Text>
        </Box>

        <Tabs colorScheme="primary" variant="enclosed">
          <TabList>
            <Tab><Icon as={User} mr={2} boxSize={4} /> Profile</Tab>
            <Tab><Icon as={Globe} mr={2} boxSize={4} /> Public Page</Tab>
            <Tab><Icon as={DollarSign} mr={2} boxSize={4} /> Services</Tab>
            <Tab><Icon as={Car} mr={2} boxSize={4} /> Vehicle</Tab>
            <Tab><Icon as={Settings} mr={2} boxSize={4} /> Business</Tab>
          </TabList>

          <TabPanels>
            {/* Profile Tab */}
            <TabPanel px={0}>
              <Card>
                <CardHeader>
                  <Heading size="md">Personal Information</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          value={formData.firstName || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          value={formData.lastName || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                          }
                        />
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="+44 7xxx xxxxxx"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Primary Location</FormLabel>
                      <Input
                        value={formData.primaryLocation || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, primaryLocation: e.target.value }))
                        }
                        placeholder="e.g., Manchester, Greater Manchester"
                      />
                      <FormHelperText>The main area where you teach</FormHelperText>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Public Page Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                {/* Username & URL */}
                <Card>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Public Profile URL</Heading>
                      <HStack>
                        <Text fontSize="sm" color="gray.500">Status:</Text>
                        {formData.isPublicProfileEnabled ? (
                          <Badge colorScheme="green">Live</Badge>
                        ) : (
                          <Badge colorScheme="gray">Hidden</Badge>
                        )}
                      </HStack>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl isInvalid={usernameStatus === "taken"}>
                        <FormLabel>Username</FormLabel>
                        <InputGroup>
                          <InputLeftAddon>https://</InputLeftAddon>
                          <Input
                            value={formData.username || ""}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            placeholder="your-username"
                          />
                          <InputLeftAddon>.indrive.com</InputLeftAddon>
                          <InputRightElement>
                            {usernameStatus === "checking" && <Spinner size="sm" />}
                            {usernameStatus === "available" && (
                              <Icon as={CheckCircle} color="green.500" />
                            )}
                            {usernameStatus === "taken" && (
                              <Icon as={XCircle} color="red.500" />
                            )}
                          </InputRightElement>
                        </InputGroup>
                        {usernameStatus === "taken" && (
                          <FormErrorMessage>This username is already taken</FormErrorMessage>
                        )}
                        <FormHelperText>
                          Lowercase letters, numbers, and hyphens only. Min 3 characters.
                        </FormHelperText>
                      </FormControl>

                      {publicProfileUrl && formData.isPublicProfileEnabled && (
                        <Alert status="success" borderRadius="md">
                          <AlertIcon />
                          <Box flex="1">
                            <Text fontWeight="medium">Your public page is live!</Text>
                            <Link href={publicProfileUrl} isExternal color="primary.500">
                              {publicProfileUrl} <ExternalLink size={14} style={{ display: "inline" }} />
                            </Link>
                          </Box>
                        </Alert>
                      )}

                      <Divider />

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <FormLabel mb={0}>Enable Public Profile</FormLabel>
                          <FormHelperText mt={1}>
                            Make your profile visible to potential students
                          </FormHelperText>
                        </Box>
                        <Switch
                          colorScheme="primary"
                          isChecked={formData.isPublicProfileEnabled}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              isPublicProfileEnabled: e.target.checked,
                            }))
                          }
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <FormLabel mb={0}>Show Pricing</FormLabel>
                          <FormHelperText mt={1}>Display your lesson rates publicly</FormHelperText>
                        </Box>
                        <Switch
                          colorScheme="primary"
                          isChecked={formData.showPricing}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, showPricing: e.target.checked }))
                          }
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <FormLabel mb={0}>Show Availability</FormLabel>
                          <FormHelperText mt={1}>
                            Let students see your available slots
                          </FormHelperText>
                        </Box>
                        <Switch
                          colorScheme="primary"
                          isChecked={formData.showAvailability}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, showAvailability: e.target.checked }))
                          }
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <FormLabel mb={0}>Accepting New Students</FormLabel>
                          <FormHelperText mt={1}>
                            Allow new students to book lessons with you
                          </FormHelperText>
                        </Box>
                        <Switch
                          colorScheme="primary"
                          isChecked={formData.acceptingNewStudents}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              acceptingNewStudents: e.target.checked,
                            }))
                          }
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Bio & About */}
                <Card>
                  <CardHeader>
                    <Heading size="md">About You</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Short Bio</FormLabel>
                        <Textarea
                          value={formData.bio || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, bio: e.target.value }))
                          }
                          placeholder="A brief introduction (shown in search results)"
                          rows={2}
                          maxLength={500}
                        />
                        <FormHelperText>
                          {(formData.bio?.length || 0)}/500 characters
                        </FormHelperText>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Full Description</FormLabel>
                        <Textarea
                          value={formData.about || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, about: e.target.value }))
                          }
                          placeholder="Tell potential students about your teaching style, experience, and what makes you unique..."
                          rows={6}
                          maxLength={2000}
                        />
                        <FormHelperText>
                          {(formData.about?.length || 0)}/2000 characters
                        </FormHelperText>
                      </FormControl>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Pass Rate (%)</FormLabel>
                          <NumberInput
                            value={formData.passRate || ""}
                            onChange={(_, value) =>
                              setFormData((prev) => ({ ...prev, passRate: value }))
                            }
                            min={0}
                            max={100}
                          >
                            <NumberInputField placeholder="e.g., 85" />
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Years Experience</FormLabel>
                          <NumberInput
                            value={formData.yearsExperience || ""}
                            onChange={(_, value) =>
                              setFormData((prev) => ({ ...prev, yearsExperience: value }))
                            }
                            min={0}
                          >
                            <NumberInputField placeholder="e.g., 10" />
                          </NumberInput>
                        </FormControl>
                      </SimpleGrid>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Services Tab - Lesson Types */}
            <TabPanel px={0}>
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Box>
                      <Heading size="md">Lesson Types</Heading>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Configure the types of lessons you offer and their pricing
                      </Text>
                    </Box>
                    <Button
                      leftIcon={<Plus size={16} />}
                      colorScheme="primary"
                      size="sm"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          lessonTypes: [
                            ...(prev.lessonTypes || []),
                            { type: "", price: 45, duration: 60, description: "" },
                          ],
                        }));
                      }}
                    >
                      Add Lesson Type
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  {(!formData.lessonTypes || formData.lessonTypes.length === 0) ? (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="medium">No lesson types configured</Text>
                        <Text fontSize="sm">Add lesson types to allow students to book specific services from your public profile.</Text>
                      </Box>
                    </Alert>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {formData.lessonTypes.map((lessonType, index) => (
                        <Card key={index} variant="outline">
                          <CardBody>
                            <VStack spacing={4} align="stretch">
                              <HStack justify="space-between">
                                <Text fontWeight="semibold" color="gray.600">Lesson Type #{index + 1}</Text>
                                <IconButton
                                  aria-label="Remove lesson type"
                                  icon={<Trash2 size={16} />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      lessonTypes: prev.lessonTypes?.filter((_, i) => i !== index),
                                    }));
                                  }}
                                />
                              </HStack>
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl isRequired>
                                  <FormLabel>Type Name</FormLabel>
                                  <Input
                                    value={lessonType.type}
                                    onChange={(e) => {
                                      const updated = [...(formData.lessonTypes || [])];
                                      updated[index] = { ...updated[index], type: e.target.value };
                                      setFormData((prev) => ({ ...prev, lessonTypes: updated }));
                                    }}
                                    placeholder="e.g., Standard Lesson, Test Prep"
                                  />
                                </FormControl>
                                <FormControl isRequired>
                                  <FormLabel>Price (£)</FormLabel>
                                  <NumberInput
                                    value={lessonType.price}
                                    onChange={(_, value) => {
                                      const updated = [...(formData.lessonTypes || [])];
                                      updated[index] = { ...updated[index], price: value || 0 };
                                      setFormData((prev) => ({ ...prev, lessonTypes: updated }));
                                    }}
                                    min={0}
                                  >
                                    <NumberInputField />
                                  </NumberInput>
                                </FormControl>
                              </SimpleGrid>
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl isRequired>
                                  <FormLabel>Duration (minutes)</FormLabel>
                                  <NumberInput
                                    value={lessonType.duration}
                                    onChange={(_, value) => {
                                      const updated = [...(formData.lessonTypes || [])];
                                      updated[index] = { ...updated[index], duration: value || 60 };
                                      setFormData((prev) => ({ ...prev, lessonTypes: updated }));
                                    }}
                                    min={15}
                                    max={480}
                                    step={15}
                                  >
                                    <NumberInputField />
                                  </NumberInput>
                                  <FormHelperText>Between 15 and 480 minutes</FormHelperText>
                                </FormControl>
                                <FormControl>
                                  <FormLabel>Description (optional)</FormLabel>
                                  <Input
                                    value={lessonType.description || ""}
                                    onChange={(e) => {
                                      const updated = [...(formData.lessonTypes || [])];
                                      updated[index] = { ...updated[index], description: e.target.value };
                                      setFormData((prev) => ({ ...prev, lessonTypes: updated }));
                                    }}
                                    placeholder="Brief description of this lesson type"
                                  />
                                </FormControl>
                              </SimpleGrid>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Vehicle Tab */}
            <TabPanel px={0}>
              <Card>
                <CardHeader>
                  <Heading size="md">Vehicle Information</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Make</FormLabel>
                        <Input
                          value={formData.vehicleInfo?.make || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              vehicleInfo: { ...prev.vehicleInfo, make: e.target.value },
                            }))
                          }
                          placeholder="e.g., Ford"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Model</FormLabel>
                        <Input
                          value={formData.vehicleInfo?.model || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              vehicleInfo: { ...prev.vehicleInfo, model: e.target.value },
                            }))
                          }
                          placeholder="e.g., Fiesta"
                        />
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Year</FormLabel>
                        <NumberInput
                          value={formData.vehicleInfo?.year || ""}
                          onChange={(_, value) =>
                            setFormData((prev) => ({
                              ...prev,
                              vehicleInfo: { ...prev.vehicleInfo, year: value },
                            }))
                          }
                          min={2000}
                          max={new Date().getFullYear() + 1}
                        >
                          <NumberInputField placeholder="e.g., 2023" />
                        </NumberInput>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Transmission</FormLabel>
                        <Select
                          value={formData.vehicleInfo?.transmission || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              vehicleInfo: { ...prev.vehicleInfo, transmission: e.target.value },
                            }))
                          }
                          placeholder="Select transmission"
                        >
                          <option value="manual">Manual</option>
                          <option value="automatic">Automatic</option>
                          <option value="both">Both Available</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Business Tab */}
            <TabPanel px={0}>
              <Card>
                <CardHeader>
                  <Heading size="md">Business Settings</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Business Name (optional)</FormLabel>
                      <Input
                        value={formData.businessName || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, businessName: e.target.value }))
                        }
                        placeholder="e.g., Smith's Driving School"
                      />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Hourly Rate</FormLabel>
                        <InputGroup>
                          <InputLeftAddon>£</InputLeftAddon>
                          <NumberInput
                            value={formData.hourlyRate || ""}
                            onChange={(_, value) =>
                              setFormData((prev) => ({ ...prev, hourlyRate: value }))
                            }
                            min={0}
                            w="full"
                          >
                            <NumberInputField borderLeftRadius={0} />
                          </NumberInput>
                        </InputGroup>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          value={formData.currency || "GBP"}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, currency: e.target.value }))
                          }
                        >
                          <option value="GBP">GBP (£)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="USD">USD ($)</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Save Button */}
        <Box position="sticky" bottom={4} bg="white" p={4} borderRadius="lg" shadow="lg" borderWidth={1}>
          <HStack justify="space-between">
            <Text color="gray.600" fontSize="sm">
              {updateMutation.isPending ? "Saving..." : "Make sure to save your changes"}
            </Text>
            <Button
              colorScheme="primary"
              size="lg"
              onClick={handleSubmit}
              isLoading={updateMutation.isPending}
              isDisabled={usernameStatus === "taken"}
            >
              Save Changes
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
}
