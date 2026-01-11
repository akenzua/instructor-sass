import type { Meta, StoryObj } from "@storybook/react";
import { TimelineItem, VStack, Text, Badge, Box } from "@acme/ui";
import { Car, CheckCircle, XCircle, Calendar, CreditCard, Clock, FileText } from "lucide-react";

const meta: Meta<typeof TimelineItem> = {
  title: "Data Display/TimelineItem",
  component: TimelineItem,
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "select",
      options: ["primary", "success", "warning", "danger", "neutral"],
    },
    isLast: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TimelineItem>;

export const Default: Story = {
  args: {
    icon: Car,
    title: "Driving Lesson",
    timestamp: "Today, 10:00 AM",
    description: "Standard 1-hour lesson completed",
  },
};

export const Success: Story = {
  args: {
    icon: CheckCircle,
    title: "Test Passed",
    timestamp: "Jan 15, 2024",
    description: "Congratulations! Driving test passed on first attempt.",
    tone: "success",
  },
};

export const Danger: Story = {
  args: {
    icon: XCircle,
    title: "Lesson Cancelled",
    timestamp: "Jan 12, 2024",
    description: "Learner cancelled within 24 hours",
    tone: "danger",
  },
};

export const Warning: Story = {
  args: {
    icon: Calendar,
    title: "Test Scheduled",
    timestamp: "Jan 10, 2024",
    description: "Practical test booked for March 15, 2024",
    tone: "warning",
  },
};

export const LessonHistory: Story = {
  render: () => (
    <VStack align="stretch" spacing={0}>
      <TimelineItem
        icon={CheckCircle}
        title="Lesson Completed"
        timestamp="Today, 11:00 AM"
        description="Mock test practice - Very good performance"
        tone="success"
      />
      <TimelineItem
        icon={Car}
        title="Lesson Completed"
        timestamp="Jan 14, 2:00 PM"
        description="Motorway driving - 2 hour session"
        tone="primary"
      />
      <TimelineItem
        icon={XCircle}
        title="Lesson Cancelled"
        timestamp="Jan 12, 10:00 AM"
        description="Cancelled by learner - Illness"
        tone="danger"
      />
      <TimelineItem
        icon={Car}
        title="Lesson Completed"
        timestamp="Jan 10, 10:00 AM"
        description="Standard lesson - Worked on parallel parking"
        tone="primary"
      />
      <TimelineItem
        icon={Calendar}
        title="First Lesson"
        timestamp="Jan 5, 9:00 AM"
        description="Assessment and introduction"
        tone="neutral"
        isLast
      />
    </VStack>
  ),
};

export const ActivityFeed: Story = {
  render: () => (
    <VStack align="stretch" spacing={0}>
      <TimelineItem
        icon={CreditCard}
        title="Payment Received"
        timestamp="2 hours ago"
        description={
          <Text fontSize="sm">
            John Smith paid <strong>£45</strong> for lesson
          </Text>
        }
        tone="success"
      />
      <TimelineItem
        icon={Calendar}
        title="Lesson Booked"
        timestamp="3 hours ago"
        description="Emma Wilson booked a lesson for Jan 20, 2:00 PM"
        tone="primary"
      />
      <TimelineItem
        icon={FileText}
        title="Progress Note Added"
        timestamp="Yesterday"
        description={
          <Box>
            <Text fontSize="sm">James Miller - Ready for test</Text>
            <Badge colorScheme="green" size="sm" mt={1}>Test Ready</Badge>
          </Box>
        }
        tone="neutral"
      />
      <TimelineItem
        icon={Clock}
        title="Reminder Sent"
        timestamp="Yesterday"
        description="Automatic reminder sent to Sarah Davis for tomorrow's lesson"
        tone="neutral"
        isLast
      />
    </VStack>
  ),
};
