import type { Meta, StoryObj } from "@storybook/react";
import { LessonCard } from "@acme/ui";

const meta: Meta<typeof LessonCard> = {
  title: "Scheduling/LessonCard",
  component: LessonCard,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["scheduled", "completed", "cancelled", "no-show"],
    },
    paymentStatus: {
      control: "select",
      options: ["pending", "paid", "refunded", "waived"],
    },
    type: {
      control: "select",
      options: ["standard", "test-prep", "mock-test", "motorway", "refresher"],
    },
    compact: {
      control: "boolean",
    },
  },
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "360px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LessonCard>;

export const Default: Story = {
  args: {
    learnerName: "Emma Wilson",
    startTime: "10:00",
    endTime: "12:00",
    duration: 120,
    type: "standard",
    status: "scheduled",
    paymentStatus: "pending",
    price: 90,
    pickupLocation: "123 Main Street, London",
  },
};

export const Completed: Story = {
  args: {
    learnerName: "James Brown",
    startTime: "14:00",
    endTime: "16:00",
    duration: 120,
    type: "test-prep",
    status: "completed",
    paymentStatus: "paid",
    price: 95,
    pickupLocation: "45 High Street, Manchester",
  },
};

export const Cancelled: Story = {
  args: {
    learnerName: "Sophie Taylor",
    startTime: "09:00",
    endTime: "11:00",
    duration: 120,
    type: "mock-test",
    status: "cancelled",
    paymentStatus: "refunded",
    price: 100,
    pickupLocation: "78 Park Road, Birmingham",
  },
};

export const NoShow: Story = {
  args: {
    learnerName: "Oliver Davies",
    startTime: "11:00",
    endTime: "12:00",
    duration: 60,
    type: "refresher",
    status: "no-show",
    paymentStatus: "pending",
    price: 45,
    pickupLocation: "12 Queen Street, Leeds",
  },
};

export const Compact: Story = {
  args: {
    learnerName: "Emma Wilson",
    startTime: "10:00",
    endTime: "12:00",
    duration: 120,
    type: "standard",
    status: "scheduled",
    paymentStatus: "pending",
    price: 90,
    compact: true,
  },
};

export const CompactPaid: Story = {
  args: {
    learnerName: "James Brown",
    startTime: "14:00",
    endTime: "16:00",
    duration: 120,
    type: "standard",
    status: "scheduled",
    paymentStatus: "paid",
    price: 90,
    compact: true,
  },
};

export const WithMenuAction: Story = {
  args: {
    learnerName: "Emma Wilson",
    startTime: "10:00",
    endTime: "12:00",
    duration: 120,
    type: "standard",
    status: "scheduled",
    paymentStatus: "pending",
    price: 90,
    pickupLocation: "123 Main Street, London",
    onMenuClick: () => alert("Menu clicked"),
  },
};

export const Clickable: Story = {
  args: {
    learnerName: "Emma Wilson",
    startTime: "10:00",
    endTime: "12:00",
    duration: 120,
    type: "motorway",
    status: "scheduled",
    paymentStatus: "pending",
    price: 100,
    pickupLocation: "M1 Services Junction 25",
    onClick: () => alert("Card clicked"),
    onMenuClick: () => alert("Menu clicked"),
  },
};
