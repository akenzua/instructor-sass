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
  Skeleton,
  Tag,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
  Wrap,
  WrapItem,
  FormControl,
  FormLabel,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import {
  Plus,
  Edit,
  Trash2,
  Lock,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSyllabuses } from "@/hooks";
import { useCreateSyllabus, useUpdateSyllabus, useDeleteSyllabus } from "@/hooks";
import type { SyllabusTopic } from "@/lib/api";

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Introduced", color: "red" },
  2: { label: "Developing", color: "orange" },
  3: { label: "Consolidating", color: "yellow" },
  4: { label: "Competent", color: "blue" },
  5: { label: "Independent", color: "green" },
};

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

export default function SyllabusPage() {
  const { data: syllabi, isLoading } = useSyllabuses();
  const { instructor } = useAuth();
  const isSchoolMember = !!(instructor as any)?.schoolId;
  const createMutation = useCreateSyllabus();
  const updateMutation = useUpdateSyllabus();
  const deleteMutation = useDeleteSyllabus();
  const toast = useToast();
  const createModal = useDisclosure();
  const topicModal = useDisclosure();
  const deleteModal = useDisclosure();

  // List / detail view state
  const [selectedSyllabus, setSelectedSyllabus] = useState<any>(null);
  const [editingSyllabusName, setEditingSyllabusName] = useState<any>(null);
  const [deletingSyllabus, setDeletingSyllabus] = useState<any>(null);
  const [syllabusForm, setSyllabusForm] = useState({ name: "", isDefault: false });

  // Topic form state
  const [editingTopic, setEditingTopic] = useState<SyllabusTopic | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    category: "",
    keySkills: "",
  });

  // Keep selected syllabus in sync with server data
  const activeSyllabus = useMemo(() => {
    if (!selectedSyllabus || !syllabi) return selectedSyllabus;
    return syllabi.find((s: any) => s._id === selectedSyllabus._id) || selectedSyllabus;
  }, [syllabi, selectedSyllabus]);

  useMemo(() => {
    if (activeSyllabus && selectedSyllabus && activeSyllabus !== selectedSyllabus) {
      setSelectedSyllabus(activeSyllabus);
    }
  }, [activeSyllabus]);

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
      topics: topics.sort((a, b) => a.order - b.order),
    }));
  }, [selectedSyllabus]);

  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch">
        <Heading size="lg">Syllabus</Heading>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height="80px" borderRadius="lg" />
        ))}
      </VStack>
    );
  }

  // --- Syllabus CRUD handlers ---
  const handleCreateSyllabus = () => {
    setEditingSyllabusName(null);
    setSyllabusForm({ name: "", isDefault: false });
    createModal.onOpen();
  };

  const handleEditSyllabusName = (syl: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingSyllabusName(syl);
    setSyllabusForm({ name: syl.name, isDefault: syl.isDefault });
    createModal.onOpen();
  };

  const handleSaveSyllabus = () => {
    if (editingSyllabusName) {
      updateMutation.mutate(
        { id: editingSyllabusName._id, data: syllabusForm },
        {
          onSuccess: () => {
            toast({ title: "Syllabus updated", status: "success" });
            createModal.onClose();
          },
          onError: () => {
            toast({ title: "Failed to update syllabus", status: "error" });
          },
        },
      );
    } else {
      createMutation.mutate(
        { ...syllabusForm, topics: [] },
        {
          onSuccess: () => {
            toast({ title: "Syllabus created", status: "success" });
            createModal.onClose();
          },
          onError: () => {
            toast({ title: "Failed to create syllabus", status: "error" });
          },
        },
      );
    }
  };

  const handleDeleteSyllabus = () => {
    if (!deletingSyllabus) return;
    deleteMutation.mutate(deletingSyllabus._id, {
      onSuccess: () => {
        toast({ title: "Syllabus deleted", status: "success" });
        deleteModal.onClose();
        if (selectedSyllabus?._id === deletingSyllabus._id) {
          setSelectedSyllabus(null);
        }
      },
      onError: () => {
        toast({ title: "Failed to delete syllabus", status: "error" });
      },
    });
  };

  // --- Topic CRUD handlers ---
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

  const handleSaveTopic = async () => {
    if (!selectedSyllabus) return;
    const currentTopics: SyllabusTopic[] = selectedSyllabus.topics || [];

    let updatedTopics: SyllabusTopic[];
    if (editingTopic) {
      updatedTopics = currentTopics.map((t) =>
        t.order === editingTopic.order
          ? {
              ...t,
              title: topicForm.title.trim(),
              description: topicForm.description.trim() || undefined,
              category: topicForm.category.trim(),
              keySkills: topicForm.keySkills.split(",").map((s) => s.trim()).filter(Boolean),
            }
          : t,
      );
    } else {
      const nextOrder = Math.max(...currentTopics.map((t) => t.order), 0) + 1;
      updatedTopics = [
        ...currentTopics,
        {
          order: nextOrder,
          title: topicForm.title.trim(),
          description: topicForm.description.trim() || undefined,
          category: topicForm.category.trim(),
          keySkills: topicForm.keySkills.split(",").map((s) => s.trim()).filter(Boolean),
        },
      ];
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedSyllabus._id,
        data: { topics: updatedTopics },
      });
      topicModal.onClose();
      toast({ title: editingTopic ? "Topic updated" : "Topic added", status: "success", duration: 2000 });
    } catch {
      toast({ title: "Failed to save topic", status: "error", duration: 3000 });
    }
  };

  const handleDeleteTopic = async (order: number) => {
    if (!selectedSyllabus) return;
    if (!confirm("Remove this topic from the syllabus?")) return;

    const updatedTopics = (selectedSyllabus.topics || [])
      .filter((t: SyllabusTopic) => t.order !== order)
      .map((t: SyllabusTopic, i: number) => ({ ...t, order: i + 1 }));

    try {
      await updateMutation.mutateAsync({
        id: selectedSyllabus._id,
        data: { topics: updatedTopics },
      });
      toast({ title: "Topic removed", status: "success", duration: 2000 });
    } catch {
      toast({ title: "Failed to remove topic", status: "error", duration: 3000 });
    }
  };

  // =========================================================================
  // DETAIL VIEW — selected syllabus with topics by category
  // =========================================================================
  if (selectedSyllabus) {
    return (
      <VStack spacing={6} align="stretch">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => setSelectedSyllabus(null)}
          alignSelf="start"
        >
          Back to Syllabi
        </Button>

        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <HStack>
              <Heading size="lg">{selectedSyllabus.name}</Heading>
              {selectedSyllabus.isDefault && <Badge colorScheme="blue">Default</Badge>}
            </HStack>
            <Text color="text.muted" fontSize="sm">
              {selectedSyllabus.topics?.length || 0} topics across {categorized.length} categories
            </Text>
          </VStack>
          {!isSchoolMember && (
            <Button leftIcon={<Plus size={16} />} colorScheme="primary" size="sm" onClick={handleAddTopic}>
              Add Topic
            </Button>
          )}
        </HStack>

        {isSchoolMember && (
          <Box p={3} bg="blue.50" borderRadius="md" display="flex" alignItems="center" gap={2}>
            <Lock size={14} />
            <Text fontSize="sm" color="blue.700">
              This syllabus is managed by your school. Contact your school admin for changes.
            </Text>
          </Box>
        )}

        {/* Scoring legend */}
        <Card size="sm">
          <CardBody>
            <HStack spacing={4} flexWrap="wrap">
              <Text fontSize="sm" fontWeight="medium">Scoring:</Text>
              {Object.entries(SCORE_LABELS).map(([score, { label, color }]) => (
                <HStack key={score} spacing={1}>
                  <Badge colorScheme={color} variant="subtle" fontSize="xs">{score}</Badge>
                  <Text fontSize="xs" color="text.muted">{label}</Text>
                </HStack>
              ))}
            </HStack>
          </CardBody>
        </Card>

        {(!selectedSyllabus.topics || selectedSyllabus.topics.length === 0) && !isSchoolMember && (
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

        {/* Topics by category */}
        <Accordion allowMultiple defaultIndex={categorized.map((_, i) => i)}>
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
                    {topics.map((topic) => (
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
                              {topic.keySkills.length > 0 && (
                                <Wrap spacing={1} mt={1}>
                                  {topic.keySkills.map((skill) => (
                                    <WrapItem key={skill}>
                                      <Tag size="sm" variant="subtle" colorScheme="gray">{skill}</Tag>
                                    </WrapItem>
                                  ))}
                                </Wrap>
                              )}
                            </VStack>
                          </HStack>
                          {!isSchoolMember && (
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
                          )}
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
      </VStack>
    );
  }

  // =========================================================================
  // LIST VIEW — all syllabi
  // =========================================================================
  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Driving Syllabus</Heading>
          <Text color="text.muted" fontSize="sm">
            {syllabi?.length || 0} {(syllabi?.length || 0) === 1 ? "syllabus" : "syllabi"}
            {isSchoolMember && " (managed by school)"}
          </Text>
        </VStack>
        {!isSchoolMember && (
          <Button leftIcon={<Plus size={16} />} colorScheme="primary" size="sm" onClick={handleCreateSyllabus}>
            Create Syllabus
          </Button>
        )}
      </HStack>

      {isSchoolMember && (
        <Box p={3} bg="blue.50" borderRadius="md" display="flex" alignItems="center" gap={2}>
          <Lock size={14} />
          <Text fontSize="sm" color="blue.700">
            These syllabi are managed by your school. Contact your school admin for changes.
          </Text>
        </Box>
      )}

      <Card>
        <CardBody p={0}>
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Topics</Th>
                <Th>Categories</Th>
                <Th>Default</Th>
                {!isSchoolMember && <Th />}
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
                      {syl.isDefault && <Badge colorScheme="blue">Default</Badge>}
                    </Td>
                    {!isSchoolMember && (
                      <Td>
                        <HStack spacing={1}>
                          <IconButton
                            aria-label="Edit name"
                            icon={<Edit size={16} />}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditSyllabusName(syl, e)}
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
                    )}
                  </Tr>
                );
              })}
              {(!syllabi || syllabi.length === 0) && (
                <Tr>
                  <Td colSpan={isSchoolMember ? 4 : 5} textAlign="center" py={8}>
                    <Text color="text.muted">No syllabi yet.</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Create / Edit Syllabus Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingSyllabusName ? "Edit Syllabus" : "Create Syllabus"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={syllabusForm.name}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, name: e.target.value })}
                  placeholder="e.g. My Custom Syllabus"
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Set as default</FormLabel>
                <input
                  type="checkbox"
                  checked={syllabusForm.isDefault}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, isDefault: e.target.checked })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={createModal.onClose}>Cancel</Button>
            <Button
              colorScheme="primary"
              onClick={handleSaveSyllabus}
              isLoading={createMutation.isPending || updateMutation.isPending}
              isDisabled={!syllabusForm.name}
            >
              {editingSyllabusName ? "Save" : "Create"}
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
            <Button variant="ghost" mr={3} onClick={deleteModal.onClose}>Cancel</Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteSyllabus}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
