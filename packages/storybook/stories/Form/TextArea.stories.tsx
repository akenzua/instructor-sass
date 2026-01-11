import type { Meta, StoryObj } from "@storybook/react";
import { FormField, TextArea } from "@acme/ui";

const meta: Meta<typeof TextArea> = {
  title: "Form/TextArea",
  component: TextArea,
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
    resize: {
      control: "select",
      options: ["none", "vertical", "horizontal", "both"],
    },
    rows: {
      control: "number",
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
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    placeholder: "Enter your message...",
  },
};

export const Outline: Story = {
  args: {
    placeholder: "Outline variant",
    variant: "outline",
  },
};

export const Filled: Story = {
  args: {
    placeholder: "Filled variant",
    variant: "filled",
  },
};

export const WithRows: Story = {
  args: {
    placeholder: "6 rows",
    rows: 6,
  },
};

export const NoResize: Story = {
  args: {
    placeholder: "Cannot be resized",
    resize: "none",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled textarea",
    isDisabled: true,
  },
};

export const Invalid: Story = {
  args: {
    placeholder: "Invalid textarea",
    isInvalid: true,
  },
};

export const WithFormField: Story = {
  render: () => (
    <FormField
      label="Notes"
      helperText="Add any additional notes about this lesson"
    >
      <TextArea placeholder="Enter lesson notes..." rows={5} />
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField
      label="Description"
      error="Description is required"
      isRequired
    >
      <TextArea placeholder="Enter description..." isInvalid />
    </FormField>
  ),
};
