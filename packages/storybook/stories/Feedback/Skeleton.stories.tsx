import type { Meta, StoryObj } from "@storybook/react";
import {
  Skeleton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonTable,
  SkeletonMetric,
  VStack,
  HStack,
  Box,
} from "@acme/ui";

const meta: Meta<typeof Skeleton> = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => (
    <Skeleton height="20px" width="200px" />
  ),
};

export const BasicShapes: Story = {
  render: () => (
    <VStack spacing={4} align="stretch" maxW="400px">
      <Skeleton height="20px" />
      <Skeleton height="20px" width="80%" />
      <Skeleton height="20px" width="60%" />
      <Skeleton height="100px" borderRadius="md" />
    </VStack>
  ),
};

export const Card: Story = {
  render: () => (
    <Box maxW="400px">
      <SkeletonCard />
    </Box>
  ),
};

export const CardWithImage: Story = {
  render: () => (
    <Box maxW="400px">
      <SkeletonCard hasImage />
    </Box>
  ),
};

export const ListItem: Story = {
  render: () => (
    <Box maxW="400px">
      <SkeletonListItem />
    </Box>
  ),
};

export const ListItems: Story = {
  render: () => (
    <VStack align="stretch" maxW="400px" divider={<Box borderBottom="1px solid" borderColor="border.default" />}>
      <SkeletonListItem />
      <SkeletonListItem />
      <SkeletonListItem />
      <SkeletonListItem />
    </VStack>
  ),
};

export const ListItemNoAvatar: Story = {
  render: () => (
    <Box maxW="400px">
      <SkeletonListItem hasAvatar={false} />
    </Box>
  ),
};

export const Table: Story = {
  render: () => (
    <SkeletonTable />
  ),
};

export const TableCustom: Story = {
  render: () => (
    <SkeletonTable rows={3} columns={5} />
  ),
};

export const Metrics: Story = {
  render: () => (
    <SkeletonMetric />
  ),
};

export const MetricsCustom: Story = {
  render: () => (
    <SkeletonMetric count={3} />
  ),
};

export const DashboardLoading: Story = {
  render: () => (
    <VStack spacing={6} align="stretch">
      <SkeletonMetric count={4} />
      <HStack spacing={6} align="start">
        <Box flex={2}>
          <Skeleton height="24px" width="150px" mb={4} />
          <SkeletonTable rows={5} columns={4} />
        </Box>
        <Box flex={1}>
          <Skeleton height="24px" width="120px" mb={4} />
          <VStack spacing={3} align="stretch">
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
          </VStack>
        </Box>
      </HStack>
    </VStack>
  ),
};
