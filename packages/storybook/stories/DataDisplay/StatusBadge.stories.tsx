import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge, HStack, VStack, Text } from "@acme/ui";

const meta: Meta<typeof StatusBadge> = {
  title: "Data Display/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: [
        "success",
        "warning",
        "error",
        "info",
        "neutral",
        "pending",
        "active",
        "inactive",
        "completed",
        "cancelled",
        "scheduled",
        "in-progress",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Default: Story = {
  args: {
    status: "success",
  },
};

export const Success: Story = {
  args: {
    status: "success",
  },
};

export const Warning: Story = {
  args: {
    status: "warning",
  },
};

export const Error: Story = {
  args: {
    status: "error",
  },
};

export const Info: Story = {
  args: {
    status: "info",
  },
};

export const Neutral: Story = {
  args: {
    status: "neutral",
  },
};

export const CustomLabel: Story = {
  args: {
    status: "success",
    label: "Passed!",
  },
};

export const Small: Story = {
  args: {
    status: "success",
    size: "sm",
  },
};

export const AllStatuses: Story = {
  render: () => (
    <VStack align="start" spacing={4}>
      <div>
        <Text fontWeight="semibold" mb={2}>General</Text>
        <HStack spacing={2}>
          <StatusBadge status="success" />
          <StatusBadge status="warning" />
          <StatusBadge status="error" />
          <StatusBadge status="info" />
          <StatusBadge status="neutral" />
        </HStack>
      </div>
      <div>
        <Text fontWeight="semibold" mb={2}>Lesson Status</Text>
        <HStack spacing={2}>
          <StatusBadge status="scheduled" />
          <StatusBadge status="in-progress" />
          <StatusBadge status="completed" />
          <StatusBadge status="cancelled" />
        </HStack>
      </div>
      <div>
        <Text fontWeight="semibold" mb={2}>User Status</Text>
        <HStack spacing={2}>
          <StatusBadge status="active" />
          <StatusBadge status="inactive" />
          <StatusBadge status="pending" />
        </HStack>
      </div>
    </VStack>
  ),
};

export const LessonStatuses: Story = {
  render: () => (
    <VStack align="start" spacing={3}>
      <HStack>
        <Text w="150px">Upcoming:</Text>
        <StatusBadge status="scheduled" />
      </HStack>
      <HStack>
        <Text w="150px">In progress:</Text>
        <StatusBadge status="in-progress" />
      </HStack>
      <HStack>
        <Text w="150px">Completed:</Text>
        <StatusBadge status="completed" />
      </HStack>
      <HStack>
        <Text w="150px">Cancelled:</Text>
        <StatusBadge status="cancelled" />
      </HStack>
      <HStack>
        <Text w="150px">Pending payment:</Text>
        <StatusBadge status="pending" label="Pending Payment" />
      </HStack>
    </VStack>
  ),
};
