import type { Meta, StoryObj } from "@storybook/react";
import { ColorModeToggle, HStack, Text, Box } from "@acme/ui";

const meta: Meta<typeof ColorModeToggle> = {
  title: "Foundation/ColorModeToggle",
  component: ColorModeToggle,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColorModeToggle>;

export const Default: Story = {
  render: () => (
    <HStack spacing={4}>
      <Text>Toggle theme:</Text>
      <ColorModeToggle />
    </HStack>
  ),
};

export const Small: Story = {
  render: () => <ColorModeToggle size="sm" />,
};

export const Medium: Story = {
  render: () => <ColorModeToggle size="md" />,
};

export const Large: Story = {
  render: () => <ColorModeToggle size="lg" />,
};

export const InHeader: Story = {
  render: () => (
    <Box
      bg="bg.surface"
      px={4}
      py={2}
      borderRadius="md"
      borderWidth="1px"
      borderColor="border.default"
    >
      <HStack justify="space-between">
        <Text fontWeight="semibold">InstructorHub</Text>
        <ColorModeToggle />
      </HStack>
    </Box>
  ),
};
