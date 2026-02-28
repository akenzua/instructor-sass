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
} from "@chakra-ui/react";
import {
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { useDefaultSyllabus } from "@/hooks";
import { useUpdateSyllabus } from "@/hooks";
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
  const { data: syllabus, isLoading } = useDefaultSyllabus();
  const updateMutation = useUpdateSyllabus();
  const toast = useToast();
  const editTopicModal = useDisclosure();
  const addTopicModal = useDisclosure();

  const [editingTopic, setEditingTopic] = useState<SyllabusTopic | null>(null);
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    category: "",
    keySkills: "",
  });

  // Group topics by category
  const categorized = useMemo(() => {
    if (!syllabus?.topics) return [];
    const groups: Record<string, SyllabusTopic[]> = {};
    for (const topic of syllabus.topics) {
      if (!groups[topic.category]) groups[topic.category] = [];
      groups[topic.category].push(topic);
    }
    return Object.entries(groups).map(([category, topics]) => ({
      category,
      topics: topics.sort((a, b) => a.order - b.order),
    }));
  }, [syllabus]);

  const handleEditTopic = (topic: SyllabusTopic) => {
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title,
      description: topic.description || "",
      category: topic.category,
      keySkills: topic.keySkills.join(", "),
    });
    editTopicModal.onOpen();
  };

  const handleSaveTopic = async () => {
    if (!syllabus || !editingTopic) return;

    const updatedTopics = syllabus.topics.map((t) =>
      t.order === editingTopic.order
        ? {
            ...t,
            title: topicForm.title.trim(),
            description: topicForm.description.trim() || undefined,
            category: topicForm.category.trim(),
            keySkills: topicForm.keySkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          }
        : t,
    );

    try {
      await updateMutation.mutateAsync({
        id: syllabus._id,
        data: { topics: updatedTopics },
      });
      editTopicModal.onClose();
      toast({ title: "Topic updated", status: "success", duration: 2000 });
    } catch {
      toast({ title: "Failed to update topic", status: "error", duration: 3000 });
    }
  };

  const handleAddTopic = () => {
    setEditingTopic(null);
    setTopicForm({
      title: "",
      description: "",
      category: categorized.length > 0 ? categorized[categorized.length - 1].category : "",
      keySkills: "",
    });
    addTopicModal.onOpen();
  };

  const handleSaveNewTopic = async () => {
    if (!syllabus) return;
    const nextOrder = Math.max(...syllabus.topics.map((t) => t.order), 0) + 1;

    const newTopic: SyllabusTopic = {
      order: nextOrder,
      title: topicForm.title.trim(),
      description: topicForm.description.trim() || undefined,
      category: topicForm.category.trim(),
      keySkills: topicForm.keySkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      await updateMutation.mutateAsync({
        id: syllabus._id,
        data: { topics: [...syllabus.topics, newTopic] },
      });
      addTopicModal.onClose();
      toast({ title: "Topic added", status: "success", duration: 2000 });
    } catch {
      toast({ title: "Failed to add topic", status: "error", duration: 3000 });
    }
  };

  const handleDeleteTopic = async (order: number) => {
    if (!syllabus) return;
    if (!confirm("Remove this topic from the syllabus?")) return;

    const updatedTopics = syllabus.topics
      .filter((t) => t.order !== order)
      .map((t, i) => ({ ...t, order: i + 1 }));

    try {
      await updateMutation.mutateAsync({
        id: syllabus._id,
        data: { topics: updatedTopics },
      });
      toast({ title: "Topic removed", status: "success", duration: 2000 });
    } catch {
      toast({ title: "Failed to remove topic", status: "error", duration: 3000 });
    }
  };

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

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Driving Syllabus</Heading>
          <Text color="text.muted" fontSize="sm">
            {syllabus?.name || "DVSA Standard Driving Syllabus"} — {syllabus?.topics.length || 0} topics
          </Text>
        </VStack>
        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="primary"
          size="sm"
          onClick={handleAddTopic}
        >
          Add Topic
        </Button>
      </HStack>

      {/* Scoring legend */}
      <Card size="sm">
        <CardBody>
          <HStack spacing={4} flexWrap="wrap">
            <Text fontSize="sm" fontWeight="medium">
              Scoring:
            </Text>
            {Object.entries(SCORE_LABELS).map(([score, { label, color }]) => (
              <HStack key={score} spacing={1}>
                <Badge colorScheme={color} variant="subtle" fontSize="xs">
                  {score}
                </Badge>
                <Text fontSize="xs" color="text.muted">
                  {label}
                </Text>
              </HStack>
            ))}
          </HStack>
        </CardBody>
      </Card>

      {/* Topics by category */}
      <Accordion allowMultiple defaultIndex={categorized.map((_, i) => i)}>
        {categorized.map(({ category, topics }) => (
          <AccordionItem key={category} border="none" mb={3}>
            <Card>
              <AccordionButton
                px={5}
                py={4}
                _hover={{ bg: "transparent" }}
                borderRadius="lg"
              >
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
                          <Badge
                            colorScheme="gray"
                            variant="outline"
                            fontSize="xs"
                            minW="28px"
                            textAlign="center"
                          >
                            {topic.order}
                          </Badge>
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {topic.title}
                            </Text>
                            {topic.description && (
                              <Text fontSize="xs" color="text.muted">
                                {topic.description}
                              </Text>
                            )}
                            {topic.keySkills.length > 0 && (
                              <Wrap spacing={1} mt={1}>
                                {topic.keySkills.map((skill) => (
                                  <WrapItem key={skill}>
                                    <Tag size="sm" variant="subtle" colorScheme="gray">
                                      {skill}
                                    </Tag>
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

      {/* Edit Topic Modal */}
      <Modal isOpen={editTopicModal.isOpen} onClose={editTopicModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Topic</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Title</FormLabel>
                <Input
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Description</FormLabel>
                <Textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  rows={2}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Category</FormLabel>
                <Input
                  value={topicForm.category}
                  onChange={(e) => setTopicForm({ ...topicForm, category: e.target.value })}
                />
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
            <Button variant="ghost" mr={3} onClick={editTopicModal.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              onClick={handleSaveTopic}
              isLoading={updateMutation.isPending}
              isDisabled={!topicForm.title.trim() || !topicForm.category.trim()}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Topic Modal */}
      <Modal isOpen={addTopicModal.isOpen} onClose={addTopicModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Topic</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Title</FormLabel>
                <Input
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Description</FormLabel>
                <Textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  rows={2}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Category</FormLabel>
                <Input
                  value={topicForm.category}
                  onChange={(e) => setTopicForm({ ...topicForm, category: e.target.value })}
                />
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
            <Button variant="ghost" mr={3} onClick={addTopicModal.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              onClick={handleSaveNewTopic}
              isLoading={updateMutation.isPending}
              isDisabled={!topicForm.title.trim() || !topicForm.category.trim()}
            >
              Add Topic
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
