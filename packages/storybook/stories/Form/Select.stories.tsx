import type { Meta, StoryObj } from "@storybook/react";
import { FormField, Select } from "@acme/ui";

const meta: Meta<typeof Select> = {
  title: "Form/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["outline", "filled"],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    isDisabled: {
      control: "boolean",
    },
    isInvalid: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const lessonTypeOptions = [
  { value: "standard", label: "Standard Lesson (1 hour)" },
  { value: "extended", label: "Extended Lesson (2 hours)" },
  { value: "assessment", label: "Mock Test Assessment" },
  { value: "motorway", label: "Motorway Lesson" },
  { value: "passp", label: "Pass Plus" },
];

const vehicleOptions = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" },
];

export const Default: Story = {
  args: {
    placeholder: "Select an option",
    options: lessonTypeOptions,
  },
};

export const Outline: Story = {
  args: {
    placeholder: "Outline variant",
    options: lessonTypeOptions,
    variant: "outline",
  },
};

export const Filled: Story = {
  args: {
    placeholder: "Filled variant",
    options: lessonTypeOptions,
    variant: "filled",
  },
};

export const Small: Story = {
  args: {
    placeholder: "Small size",
    options: vehicleOptions,
    size: "sm",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled",
    options: lessonTypeOptions,
    isDisabled: true,
  },
};

export const Invalid: Story = {
  args: {
    placeholder: "Invalid",
    options: lessonTypeOptions,
    isInvalid: true,
  },
};

export const WithDisabledOption: Story = {
  args: {
    placeholder: "Select lesson type",
    options: [
      { value: "standard", label: "Standard Lesson" },
      { value: "extended", label: "Extended Lesson", disabled: true },
      { value: "assessment", label: "Mock Test" },
    ],
  },
};

export const WithFormField: Story = {
  render: () => (
    <FormField
      label="Lesson Type"
      helperText="Choose the type of lesson to schedule"
      isRequired
    >
      <Select
        placeholder="Select lesson type"
        options={lessonTypeOptions}
      />
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField
      label="Vehicle Type"
      error="Please select a vehicle type"
      isRequired
    >
      <Select
        placeholder="Select vehicle"
        options={vehicleOptions}
        isInvalid
      />
    </FormField>
  ),
};
