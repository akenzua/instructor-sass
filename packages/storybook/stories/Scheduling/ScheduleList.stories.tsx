import type { Meta, StoryObj } from "@storybook/react";
import { ScheduleList, Box } from "@acme/ui";
import type { ScheduleDay } from "@acme/ui";

const meta: Meta<typeof ScheduleList> = {
  title: "Scheduling/ScheduleList",
  component: ScheduleList,
  tags: ["autodocs"],
  argTypes: {
    showDateHeaders: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ScheduleList>;

const scheduleDays: ScheduleDay[] = [
  {
    date: "January 15, 2024",
    dayLabel: "Monday",
    items: [
      { id: "1", startTime: "8:00 AM", endTime: "9:00 AM", status: "booked", title: "Sarah Davis", subtitle: "Standard Lesson" },
      { id: "2", startTime: "10:00 AM", endTime: "12:00 PM", status: "booked", title: "Emma Wilson", subtitle: "Mock Test (2 hours)" },
      { id: "3", startTime: "2:00 PM", endTime: "3:00 PM", status: "booked", title: "John Smith", subtitle: "Standard Lesson" },
    ],
  },
  {
    date: "January 16, 2024",
    dayLabel: "Tuesday",
    items: [
      { id: "4", startTime: "9:00 AM", endTime: "10:00 AM", status: "booked", title: "James Miller", subtitle: "Test Prep" },
      { id: "5", startTime: "11:00 AM", endTime: "12:00 PM", status: "pending", title: "New Booking", subtitle: "Awaiting confirmation" },
      { id: "6", startTime: "3:00 PM", endTime: "4:00 PM", status: "booked", title: "Sarah Davis", subtitle: "Standard Lesson" },
    ],
  },
  {
    date: "January 17, 2024",
    dayLabel: "Wednesday",
    items: [
      { id: "7", startTime: "10:00 AM", endTime: "11:00 AM", status: "booked", title: "Emma Wilson", subtitle: "Standard Lesson" },
    ],
  },
];

export const Default: Story = {
  args: {
    days: scheduleDays,
  },
};

export const Empty: Story = {
  args: {
    days: [
      { date: "January 15, 2024", dayLabel: "Monday", items: [] },
      { date: "January 16, 2024", dayLabel: "Tuesday", items: [] },
    ],
    emptyTitle: "No lessons scheduled",
    emptyDescription: "You don't have any lessons scheduled for this period.",
  },
};

export const SingleDay: Story = {
  args: {
    days: [
      {
        date: "January 15, 2024",
        dayLabel: "Today",
        items: [
          { id: "1", startTime: "9:00 AM", endTime: "10:00 AM", status: "booked", title: "John Smith", subtitle: "Standard Lesson" },
          { id: "2", startTime: "11:00 AM", endTime: "12:00 PM", status: "booked", title: "Emma Wilson", subtitle: "Extended Lesson" },
          { id: "3", startTime: "2:00 PM", endTime: "3:00 PM", status: "pending", title: "Pending", subtitle: "New booking request" },
          { id: "4", startTime: "4:00 PM", endTime: "5:00 PM", status: "booked", title: "Sarah Davis", subtitle: "Mock Test" },
        ],
      },
    ],
    showDateHeaders: true,
  },
};

export const NoHeaders: Story = {
  args: {
    days: [
      {
        date: "Today",
        dayLabel: "",
        items: [
          { id: "1", startTime: "9:00 AM", endTime: "10:00 AM", status: "booked", title: "John Smith", subtitle: "Standard Lesson" },
          { id: "2", startTime: "11:00 AM", endTime: "12:00 PM", status: "booked", title: "Emma Wilson", subtitle: "Extended Lesson" },
        ],
      },
    ],
    showDateHeaders: false,
  },
};

export const Clickable: Story = {
  render: () => (
    <Box maxW="500px">
      <ScheduleList
        days={scheduleDays}
        onSlotClick={(item) => alert(`Clicked: ${item.title} (${item.startTime})`)}
      />
    </Box>
  ),
};

export const MobileView: Story = {
  render: () => (
    <Box maxW="375px" mx="auto" bg="bg.canvas" p={4} borderRadius="lg">
      <ScheduleList
        days={scheduleDays.slice(0, 2)}
        onSlotClick={(item) => console.log("Clicked:", item)}
      />
    </Box>
  ),
};
