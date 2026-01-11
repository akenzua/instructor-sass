import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, FormField, VStack } from "@acme/ui";

const meta: Meta<typeof Checkbox> = {
  title: "Form/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    isDisabled: {
      control: "boolean",
    },
    isInvalid: {
      control: "boolean",
    },
    isChecked: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: "Accept terms and conditions",
  },
};

export const Checked: Story = {
  args: {
    label: "Checked",
    defaultChecked: true,
  },
};

export const Small: Story = {
  args: {
    label: "Small size",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    label: "Medium size",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    label: "Large size",
    size: "lg",
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled checkbox",
    isDisabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: "Disabled and checked",
    isDisabled: true,
    defaultChecked: true,
  },
};

export const Invalid: Story = {
  args: {
    label: "Invalid checkbox",
    isInvalid: true,
  },
};

export const CheckboxGroup: Story = {
  render: () => (
    <FormField label="Lesson preferences">
      <VStack align="start" spacing={2}>
        <Checkbox label="Morning lessons (8am - 12pm)" />
        <Checkbox label="Afternoon lessons (12pm - 5pm)" />
        <Checkbox label="Evening lessons (5pm - 8pm)" />
        <Checkbox label="Weekend availability" />
      </VStack>
    </FormField>
  ),
};

export const WithFormField: Story = {
  render: () => (
    <FormField
      label="Agreement"
      error="You must accept the terms"
    >
      <Checkbox label="I accept the terms and conditions" isInvalid />
    </FormField>
  ),
};
