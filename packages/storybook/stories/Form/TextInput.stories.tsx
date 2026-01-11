import type { Meta, StoryObj } from "@storybook/react";
import { FormField, TextInput } from "@acme/ui";
import { Mail, Lock, Search, User } from "lucide-react";

const meta: Meta<typeof TextInput> = {
  title: "Form/TextInput",
  component: TextInput,
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
    isReadOnly: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

// Default
export const Default: Story = {
  args: {
    placeholder: "Enter text...",
    variant: "outline",
    size: "md",
  },
};

// Variants
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

// Sizes
export const Small: Story = {
  args: {
    placeholder: "Small size",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    placeholder: "Medium size",
    size: "md",
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    placeholder: "Search...",
    leftIcon: Search,
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: "Enter email",
    rightIcon: Mail,
  },
};

// States
export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    isDisabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    value: "Read only value",
    isReadOnly: true,
  },
};

export const Invalid: Story = {
  args: {
    placeholder: "Invalid input",
    isInvalid: true,
  },
};

// With FormField
export const WithFormField: Story = {
  render: () => (
    <FormField
      label="Email Address"
      helperText="We'll never share your email."
      isRequired
    >
      <TextInput placeholder="you@example.com" leftIcon={Mail} />
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField
      label="Email Address"
      error="Please enter a valid email address"
      isRequired
    >
      <TextInput placeholder="you@example.com" leftIcon={Mail} isInvalid />
    </FormField>
  ),
};

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "400px" }}>
      <div>
        <h3 style={{ marginBottom: "12px", fontWeight: "600" }}>Variants</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <TextInput placeholder="Outline variant" variant="outline" />
          <TextInput placeholder="Filled variant" variant="filled" />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: "12px", fontWeight: "600" }}>With Icons</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <TextInput placeholder="Search..." leftIcon={Search} />
          <TextInput placeholder="Username" leftIcon={User} />
          <TextInput placeholder="Password" leftIcon={Lock} type="password" />
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: "12px", fontWeight: "600" }}>States</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <TextInput placeholder="Default" />
          <TextInput placeholder="Disabled" isDisabled />
          <TextInput value="Read only" isReadOnly />
          <TextInput placeholder="Invalid" isInvalid />
        </div>
      </div>
    </div>
  ),
};
