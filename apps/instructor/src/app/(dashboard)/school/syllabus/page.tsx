"use client";

import { useState, useMemo } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
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
  Spinner,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Wrap,
  WrapItem,
  Tag,
  Select,
} from "@chakra-ui/react";
import { Plus, Edit, Trash2, ArrowLeft, ChevronRight } from "lucide-react";
import { useMySchool, useSchoolSyllabusList } from "@/hooks/queries";
import {
  useCreateSchoolSyllabus,
  useUpdateSchoolSyllabus,
  useDeleteSchoolSyllabus,
} from "@/hooks/mutations";

interface SyllabusTopic {
  order: number;
  title: string;
  description?: string;
  category: string;
  keySkills: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Vehicle Controls & Precautions": "blue",
  "Road Procedure": "teal",
  "Junctions & Roundabouts": "purple",
  "Judgement & Meeting Traffic": "orange",
  "Awareness & Planning": "cyan",
  "Manoeuvres": "pink",
  "Emergency & Independent": "red",
  "Additional Road Types & Conditions": "green",
  "Test Preparation": "yellow",
};

export default function SchoolSyllabusPage() {
  const { data: school, isLoading: schoolLoading } = useMySchool();
  const schoolId = school?._id || "";
  const { data: syllabi, isLoading: syllabusLoading } = useSchoolSyllabusList(schoolId);
  const createMutation = useCreateSchoolSyllabus();
  const updateMutation = useUpdateSchoolSyllabus();
  const deleteMutation = useDeleteSchoolSyllabus();
  const toast = useToast();
  const modal = useDisclosure();
  const deleteModal = useDisclosure();
  const topicModal = useDisclosure();

  const [editingSyllabus, setEditingSyllabus] = useState<any>(null);
  const [deletingSyllabus, setDeletingSyllabus] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", isDefault: false });

  // Detail view state
  const [selectedSyllabus, setSelectedSyllabus] = useState<any>(null);
  const [editingTopic, setEditingTopic] = useState<SyllabusTopic | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    category: "",
    keySkills: "",
  });

  // Group topics by category for selected syllabus
  const categorized = useMemo(() => {
    if (!selectedSyllabus?.topics) return [];
    const groups: Record<string, SyllabusTopic[]> = {};
    for (const topic of selectedSyllabus.topics) {
      if (!groups[topic.category]) groups[topic.category] = [];
      groups[topic.category].push(topic);
    }
    return Object.entries(groups).map(([category, topics]) => ({
      category,
      topics: topics.sort((a: SyllabusTopic, b: SyllabusTopic) => a.order - b.order),
    }));
  }, [selectedSyllabus]);

  // Keep selectedSyllabus in sync with server data
  const activeSyllabus = useMemo(() => {
    if (!selectedSyllabus || !syllabi) return selectedSyllabus;
    return syllabi.find((s: any) => s._id === selectedSyllabus._id) || selectedSyllabus;
  }, [syllabi, selectedSyllabus]);

  // Sync activeSyllabus back to selectedSyllabus when syllabi updates
  useMemo(() => {
    if (activeSyllabus && selectedSyllabus && activeSyllabus !== selectedSyllabus) {
      setSelectedSyllabus(activeSyllabus);
    }
  }, [activeSyllabus]);

  if (schoolLoading || syllabusLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  const handleCreate = () => {
    setEditingSyllabus(null);
    setFormData({ name: "", isDefault: false });
    modal.onOpen();
  };

  const handleEdit = (syl: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingSyllabus(syl);
    setFormData({ name: syl.name, isDefault: syl.isDefault });
    modal.onOpen();
  };

  const handleSave = () => {
    if (editingSyllabus) {
      updateMutation.mutate(
        { schoolId, syllabusId: editingSyllabus._id, data: formData },
        {
          onSuccess: () => {
            toast({ title: "Syllabus updated", status: "success" });
            modal.onClose();
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
          },
        },
      );
    } else {
      createMutation.mutate(
        { schoolId, data: { ...formData, topics: [] } },
        {
          onSuccess: () => {
            toast({ title: "Syllabus created", status: "success" });
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
    if (!deletingSyllabus) return;
    deleteMutation.mutate(
      { schoolId, syllabusId: deletingSyllabus._id },
      {
        onSuccess: () => {
          toast({ title: "Syllabus deleted", status: "success" });
          deleteModal.onClose();
          if (selectedSyllabus?._id === deletingSyllabus._id) {
            setSelectedSyllabus(null);
          }
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
        },
      },
    );
  };

  // --- Topic management ---
  const handleAddTopic = () => {
    setEditingTopic(null);
    setIsNewCategory(false);
    setTopicForm({
      title: "",
      description: "",
      category: categorized.length > 0 ? categorized[categorized.length - 1].category : "",
      keySkills: "",
    });
    topicModal.onOpen();
  };

  const handleEditTopic = (topic: SyllabusTopic) => {
    setEditingTopic(topic);
    const existingCats = categorized.map((c) => c.category);
    setIsNewCategory(!existingCats.includes(topic.category));
    setTopicForm({
      title: topic.title,
      description: topic.description || "",
      category: topic.category,
      keySkills: topic.keySkills.join(", "),
    });
    topicModal.onOpen();
  };

  const handleSaveTopic = () => {
    if (!selectedSyllabus) return;
    const currentTopics: SyllabusTopic[] = selectedSyllabus.topics || [];

    let updatedTopics: SyllabusTopic[];
    if (editingTopic) {
      updatedTopics = currentTopics.map((t: SyllabusTopic) =>
        t.order === editingTopic.order
          ? {
              ...t,
              title: topicForm.title.trim(),
              description: topicForm.description.trim() || undefined,
              category: topicForm.category.trim(),
              keySkills: topicForm.keySkills.split(",").map((s: string) => s.trim()).filter(Boolean),
            }
          : t,
      );
    } else {
      const nextOrder = Math.max(...currentTopics.map((t: SyllabusTopic) => t.order), 0) + 1;
      updatedTopics = [
        ...currentTopics,
        {
          order: nextOrder,
          title: topicForm.title.trim(),
          description: topicForm.description.trim() || undefined,
          category: topicForm.category.trim(),
          keySkills: topicForm.keySkills.split(",").map((s: string) => s.trim()).filter(Boolean),
        },
      ];
    }

    updateMutation.mutate(
      { schoolId, syllabusId: selectedSyllabus._id, data: { topics: updatedTopics } },
      {
        onSuccess: () => {
          toast({ title: editingTopic ? "Topic updated" : "Topic added", status: "success" });
          topicModal.onClose();
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
        },
      },
    );
  };

  const handleDeleteTopic = (order: number) => {
    if (!selectedSyllabus) return;
    if (!confirm("Remove this topic from the syllabus?")) return;

    const updatedTopics = (selectedSyllabus.topics || [])
      .filter((t: SyllabusTopic) => t.order !== order)
      .map((t: SyllabusTopic, i: number) => ({ ...t, order: i + 1 }));

    updateMutation.mutate(
      { schoolId, syllabusId: selectedSyllabus._id, data: { topics: updatedTopics } },
      {
        onSuccess: () => {
          toast({ title: "Topic removed", status: "success" });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
        },
      },
    );
  };

  // --- Detail view ---
  if (selectedSyllabus) {
    return (
      <Box>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => setSelectedSyllabus(null)}
          mb={4}
        >
          Back to Syllabi
        </Button>

        <HStack justify="space-between" mb={4}>
          <VStack align="start" spacing={1}>
            <HStack>
              <Heading size="lg">{selectedSyllabus.name}</Heading>
              {selectedSyllabus.isDefault && <Badge colorScheme="blue">Default</Badge>}
            </HStack>
            <Text color="text.muted" fontSize="sm">
              {selectedSyllabus.topics?.length || 0} topics across {categorized.length} categories
            </Text>
          </VStack>
          <Button leftIcon={<Plus size={16} />} colorScheme="primary" size="sm" onClick={handleAddTopic}>
            Add Topic
          </Button>
        </HStack>

        {(!selectedSyllabus.topics || selectedSyllabus.topics.length === 0) && (
          <Card>
            <CardBody textAlign="center" py={10}>
              <Text color="text.muted" mb={4}>
                No topics yet. Add topics to build your syllabus with categories, descriptions, and key skills.
              </Text>
              <Button leftIcon={<Plus size={16} />} colorScheme="primary" onClick={handleAddTopic}>
                Add First Topic
              </Button>
            </CardBody>
          </Card>
        )}

        <Accordion allowMultiple defaultIndex={categorized.map((_: any, i: number) => i)}>
          {categorized.map(({ category, topics }) => (
            <AccordionItem key={category} border="none" mb={3}>
              <Card>
                <AccordionButton px={5} py={4} _hover={{ bg: "transparent" }} borderRadius="lg">
                  <HStack flex={1} spacing={3}>
                    <Badge
                      colorScheme={CATEGORY_COLORS[category] || "gray"}
                      fontSize="xs"
                      px={2}
                      py={0.5}
                    >
                      {topics.length} topics
                    </Badge>
                    <Heading size="sm">{category}</Heading>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel pb={4} px={5}>
                  <VStack spacing={3} align="stretch">
                    {topics.map((topic: SyllabusTopic) => (
                      <Box
                        key={topic.order}
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        _hover={{ borderColor: "primary.300", bg: "bg.subtle" }}
                        transition="all 0.15s"
                      >
                        <HStack justify="space-between" align="start">
                          <HStack spacing={3} align="start" flex={1}>
                            <Badge colorScheme="gray" variant="outline" fontSize="xs" minW="28px" textAlign="center">
                              {topic.order}
                            </Badge>
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="semibold" fontSize="sm">{topic.title}</Text>
                              {topic.description && (
                                <Text fontSize="xs" color="text.muted">{topic.description}</Text>
                              )}
                              {topic.keySkills?.length > 0 && (
                                <Wrap spacing={1} mt={1}>
                                  {topic.keySkills.map((skill: string) => (
                                    <WrapItem key={skill}>
                                      <Tag size="sm" variant="subtle" colorScheme="gray">{skill}</Tag>
                                    </WrapItem>
                                  ))}
                                </Wrap>
                              )}
                            </VStack>
                          </HStack>
                          <HStack spacing={1}>
                            <IconButton
                              aria-label="Edit topic"
                              icon={<Edit size={14} />}
                              size="xs"
                              variant="ghost"
                              onClick={() => handleEditTopic(topic)}
                            />
                            <IconButton
                              aria-label="Remove topic"
                              icon={<Trash2 size={14} />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteTopic(topic.order)}
                            />
                          </HStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </AccordionPanel>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Add / Edit Topic Modal */}
        <Modal isOpen={topicModal.isOpen} onClose={topicModal.onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{editingTopic ? "Edit Topic" : "Add Topic"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Title</FormLabel>
                  <Input
                    value={topicForm.title}
                    onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                    placeholder="e.g. Cockpit Drill"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Description</FormLabel>
                  <Textarea
                    value={topicForm.description}
                    onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                    rows={2}
                    placeholder="Brief description of this topic"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Category</FormLabel>
                  {isNewCategory ? (
                    <HStack>
                      <Input
                        value={topicForm.category}
                        onChange={(e) => setTopicForm({ ...topicForm, category: e.target.value })}
                        placeholder="Enter new category name"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsNewCategory(false);
                          setTopicForm({ ...topicForm, category: categorized.length > 0 ? categorized[0].category : "" });
                        }}
                      >
                        Cancel
                      </Button>
                    </HStack>
                  ) : (
                    <Select
                      value={topicForm.category}
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          setIsNewCategory(true);
                          setTopicForm({ ...topicForm, category: "" });
                        } else {
                          setTopicForm({ ...topicForm, category: e.target.value });
                        }
                      }}
                      placeholder="Select a category"
                    >
                      {categorized.map(({ category }) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                      <option value="__new__">+ Create new category</option>
                    </Select>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Key Skills (comma-separated)</FormLabel>
                  <Input
                    value={topicForm.keySkills}
                    onChange={(e) => setTopicForm({ ...topicForm, keySkills: e.target.value })}
                    placeholder="Skill 1, Skill 2, Skill 3"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={topicModal.onClose}>Cancel</Button>
              <Button
                colorScheme="primary"
                onClick={handleSaveTopic}
                isLoading={updateMutation.isPending}
                isDisabled={!topicForm.title.trim() || !topicForm.category.trim()}
              >
                {editingTopic ? "Save" : "Add Topic"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  }

  // --- List view ---
  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">School Syllabus</Heading>
        <Button leftIcon={<Plus size={18} />} colorScheme="primary" onClick={handleCreate}>
          Create Syllabus
        </Button>
      </HStack>

      <Text color="text.muted" mb={4}>
        Create syllabus templates that all school instructors will inherit. Click a syllabus to manage its topics.
      </Text>

      <Card>
        <CardBody p={0}>
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Topics</Th>
                <Th>Categories</Th>
                <Th>Default</Th>
                <Th>Created</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {(syllabi || []).map((syl: any) => {
                const categoryCount = new Set((syl.topics || []).map((t: any) => t.category)).size;
                return (
                  <Tr
                    key={syl._id}
                    cursor="pointer"
                    _hover={{ bg: "bg.subtle" }}
                    onClick={() => setSelectedSyllabus(syl)}
                  >
                    <Td fontWeight="medium">
                      <HStack>
                        <Text>{syl.name}</Text>
                        <ChevronRight size={14} />
                      </HStack>
                    </Td>
                    <Td>{syl.topics?.length || 0} topics</Td>
                    <Td>{categoryCount} {categoryCount === 1 ? "category" : "categories"}</Td>
                    <Td>
                      {syl.isDefault ? (
                        <Badge colorScheme="blue">Default</Badge>
                      ) : (
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateMutation.mutate(
                              { schoolId, syllabusId: syl._id, data: { isDefault: true } },
                              {
                                onSuccess: () => {
                                  toast({ title: `"${syl.name}" set as default`, status: "success" });
                                },
                                onError: (err: any) => {
                                  toast({ title: "Error", description: err.response?.data?.message || "Failed", status: "error" });
                                },
                              },
                            );
                          }}
                        >
                          Set as Default
                        </Button>
                      )}
                    </Td>
                    <Td fontSize="sm">
                      {new Date(syl.createdAt).toLocaleDateString()}
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Edit"
                          icon={<Edit size={16} />}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEdit(syl, e)}
                        />
                        <IconButton
                          aria-label="Delete"
                          icon={<Trash2 size={16} />}
                          variant="ghost"
                          colorScheme="red"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingSyllabus(syl);
                            deleteModal.onOpen();
                          }}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
              {(!syllabi || syllabi.length === 0) && (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={8}>
                    <Text color="text.muted">No school syllabi yet. Create one for your instructors.</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Create / Edit Syllabus Modal */}
      <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingSyllabus ? "Edit Syllabus" : "Create Syllabus"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. DVSA Standard Syllabus"
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Set as default</FormLabel>
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
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
              {editingSyllabus ? "Save" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Syllabus</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete &ldquo;{deletingSyllabus?.name}&rdquo;?</Text>
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
