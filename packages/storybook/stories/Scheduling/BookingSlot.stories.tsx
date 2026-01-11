import type { Meta, StoryObj } from "@storybook/react";
import { BookingSlot, VStack, Box, Text } from "@acme/ui";

const meta: Meta<typeof BookingSlot> = {
  title: "Scheduling/BookingSlot",
  component: BookingSlot,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["available", "booked", "pending", "blocked", "past"],
    },
    isSelectable: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BookingSlot>;

export const Default: Story = {
  args: {
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    title: "John Smith",
    subtitle: "Standard Lesson",
    status: "booked",
  },
};

export const Available: Story = {
  args: {
    startTime: "2:00 PM",
    endTime: "3:00 PM",
    title: "Available",
    status: "available",
  },
};

export const Booked: Story = {
  args: {
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    title: "Emma Wilson",
    subtitle: "Mock Test Prep",
    status: "booked",
  },
};

export const Pending: Story = {
  args: {
    startTime: "3:00 PM",
    endTime: "4:00 PM",
    title: "Pending Confirmation",
    subtitle: "James Miller",
    status: "pending",
  },
};

export const Blocked: Story = {
  args: {
    startTime: "12:00 PM",
    endTime: "1:00 PM",
    title: "Blocked",
    subtitle: "Lunch break",
    status: "blocked",
  },
};

export const Past: Story = {
  args: {
    startTime: "9:00 AM",
    endTime: "10:00 AM",
    title: "John Smith",
    subtitle: "Completed",
    status: "past",
  },
};

export const AllStatuses: Story = {
  render: () => (
    <VStack spacing={3} align="stretch" maxW="400px">
      <BookingSlot
        startTime="9:00 AM"
        endTime="10:00 AM"
        title="Past Lesson"
        subtitle="Already completed"
        status="past"
      />
      <BookingSlot
        startTime="10:00 AM"
        endTime="11:00 AM"
        title="John Smith"
        subtitle="Standard Lesson"
        status="booked"
      />
      <BookingSlot
        startTime="11:00 AM"
        endTime="12:00 PM"
        title="Pending"
        subtitle="Awaiting confirmation"
        status="pending"
      />
      <BookingSlot
        startTime="12:00 PM"
        endTime="1:00 PM"
        title="Blocked"
        subtitle="Lunch break"
        status="blocked"
      />
      <BookingSlot
        startTime="1:00 PM"
        endTime="2:00 PM"
        title="Available"
        status="available"
      />
    </VStack>
  ),
};

export const DaySchedule: Story = {
  render: () => (
    <Box>
      <Text fontWeight="semibold" mb={3}>Monday, January 15</Text>
      <VStack spacing={2} align="stretch" maxW="400px">
        <BookingSlot
          startTime="8:00 AM"
          endTime="9:00 AM"
          title="Sarah Davis"
          subtitle="Extended Lesson"
          status="booked"
          onClick={() => alert("View lesson details")}
        />
        <BookingSlot
          startTime="9:00 AM"
          endTime="10:00 AM"
          title="Available"
          status="available"
          onClick={() => alert("Book this slot")}
        />
        <BookingSlot
          startTime="10:00 AM"
          endTime="12:00 PM"
          title="Emma Wilson"
          subtitle="Mock Test (2 hours)"
          status="booked"
          onClick={() => alert("View lesson details")}
        />
        <BookingSlot
          startTime="12:00 PM"
          endTime="1:00 PM"
          title="Lunch Break"
          status="blocked"
          isSelectable={false}
        />
        <BookingSlot
          startTime="1:00 PM"
          endTime="2:00 PM"
          title="John Smith"
          subtitle="Standard Lesson"
          status="booked"
          onClick={() => alert("View lesson details")}
        />
      </VStack>
    </Box>
  ),
};
