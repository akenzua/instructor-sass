import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, FormField } from "@acme/ui";

const meta: Meta<typeof RadioGroup> = {
  title: "Form/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    direction: {
      control: "select",
      options: ["row", "column"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

const vehicleOptions = [
  { value: "manual", label: "Manual transmission" },
  { value: "automatic", label: "Automatic transmission" },
];

const lessonLengthOptions = [
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const paymentOptions = [
  { value: "per-lesson", label: "Pay per lesson" },
  { value: "block-5", label: "Block of 5 lessons (10% off)" },
  { value: "block-10", label: "Block of 10 lessons (15% off)" },
];

export const Default: Story = {
  args: {
    options: vehicleOptions,
    defaultValue: "manual",
  },
};

export const Column: Story = {
  args: {
    options: lessonLengthOptions,
    direction: "column",
  },
};

export const Row: Story = {
  args: {
    options: vehicleOptions,
    direction: "row",
  },
};

export const Small: Story = {
  args: {
    options: vehicleOptions,
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    options: vehicleOptions,
    size: "lg",
  },
};

export const WithDisabledOption: Story = {
  args: {
    options: [
      { value: "manual", label: "Manual" },
      { value: "automatic", label: "Automatic", disabled: true },
    ],
  },
};

export const WithFormField: Story = {
  render: () => (
    <FormField
      label="Transmission Type"
      helperText="Choose your preferred vehicle type"
      isRequired
    >
      <RadioGroup options={vehicleOptions} defaultValue="manual" />
    </FormField>
  ),
};

export const PaymentPlanSelection: Story = {
  render: () => (
    <FormField
      label="Payment Plan"
      helperText="Select how you'd like to pay for lessons"
    >
      <RadioGroup
        options={paymentOptions}
        defaultValue="per-lesson"
        spacing={4}
      />
    </FormField>
  ),
};
