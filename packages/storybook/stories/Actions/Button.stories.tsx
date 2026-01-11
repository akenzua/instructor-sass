import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@acme/ui";
import { Plus, Download, ChevronRight } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "Actions/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline", "ghost"],
    },
    tone: {
      control: "select",
      options: ["primary", "neutral", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    isDisabled: {
      control: "boolean",
    },
    isLoading: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Default
export const Default: Story = {
  args: {
    children: "Button",
    variant: "solid",
    tone: "primary",
    size: "md",
  },
};

// Variants
export const Solid: Story = {
  args: {
    children: "Solid Button",
    variant: "solid",
    tone: "primary",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline Button",
    variant: "outline",
    tone: "primary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost Button",
    variant: "ghost",
    tone: "primary",
  },
};

// Tones
export const Primary: Story = {
  args: {
    children: "Primary",
    variant: "solid",
    tone: "primary",
  },
};

export const Neutral: Story = {
  args: {
    children: "Neutral",
    variant: "solid",
    tone: "neutral",
  },
};

export const Danger: Story = {
  args: {
    children: "Danger",
    variant: "solid",
    tone: "danger",
  },
};

// Sizes
export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    children: "Medium",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    children: "Add New",
    leftIcon: Plus,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: "Continue",
    rightIcon: ChevronRight,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: "Download",
    leftIcon: Download,
    rightIcon: ChevronRight,
  },
};

// States
export const Disabled: Story = {
  args: {
    children: "Disabled",
    isDisabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: "Loading",
    isLoading: true,
  },
};

// All Variants Matrix
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h3 style={{ marginBottom: "12px", fontWeight: "600" }}>Solid</h3>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button variant="solid" tone="primary">Primary</Button>
          <Button variant="solid" tone="neutral">Neutral</Button>
          <Button variant="solid" tone="danger">Danger</Button>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: "12px", fontWeight: "600" }}>Outline</h3>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button variant="outline" tone="primary">Primary</Button>
          <Button variant="outline" tone="neutral">Neutral</Button>
          <Button variant="outline" tone="danger">Danger</Button>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: "12px", fontWeight: "600" }}>Ghost</h3>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button variant="ghost" tone="primary">Primary</Button>
          <Button variant="ghost" tone="neutral">Neutral</Button>
          <Button variant="ghost" tone="danger">Danger</Button>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: "12px", fontWeight: "600" }}>Sizes</h3>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
    </div>
  ),
};
