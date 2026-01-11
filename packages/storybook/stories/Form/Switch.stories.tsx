import type { Meta, StoryObj } from "@storybook/react";
import { Switch, VStack, HStack, Text } from "@acme/ui";

const meta: Meta<typeof Switch> = {
  title: "Form/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    labelPosition: {
      control: "select",
      options: ["left", "right"],
    },
    isDisabled: {
      control: "boolean",
    },
    isChecked: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    label: "Enable notifications",
    id: "notifications",
  },
};

export const NoLabel: Story = {
  args: {},
};

export const LabelLeft: Story = {
  args: {
    label: "Dark mode",
    labelPosition: "left",
    id: "dark-mode",
  },
};

export const LabelRight: Story = {
  args: {
    label: "Email reminders",
    labelPosition: "right",
    id: "email-reminders",
  },
};

export const Small: Story = {
  args: {
    label: "Small switch",
    size: "sm",
    id: "small",
  },
};

export const Medium: Story = {
  args: {
    label: "Medium switch",
    size: "md",
    id: "medium",
  },
};

export const Large: Story = {
  args: {
    label: "Large switch",
    size: "lg",
    id: "large",
  },
};

export const Checked: Story = {
  args: {
    label: "Enabled",
    defaultChecked: true,
    id: "checked",
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled",
    isDisabled: true,
    id: "disabled",
  },
};

export const DisabledChecked: Story = {
  args: {
    label: "Disabled and checked",
    isDisabled: true,
    defaultChecked: true,
    id: "disabled-checked",
  },
};

export const NotificationSettings: Story = {
  render: () => (
    <VStack align="stretch" spacing={4} maxW="400px">
      <Text fontWeight="semibold">Notification Settings</Text>
      <HStack justify="space-between">
        <Text>Email notifications</Text>
        <Switch id="email" defaultChecked />
      </HStack>
      <HStack justify="space-between">
        <Text>SMS reminders</Text>
        <Switch id="sms" defaultChecked />
      </HStack>
      <HStack justify="space-between">
        <Text>Push notifications</Text>
        <Switch id="push" />
      </HStack>
      <HStack justify="space-between">
        <Text>Marketing emails</Text>
        <Switch id="marketing" />
      </HStack>
    </VStack>
  ),
};
