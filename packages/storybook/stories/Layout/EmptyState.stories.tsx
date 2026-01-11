import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState, Button } from "@acme/ui";
import { Users, Calendar, FileText, Search, Plus, CreditCard } from "lucide-react";

const meta: Meta<typeof EmptyState> = {
  title: "Layout/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: FileText,
    title: "No data found",
    description: "There is no data to display at the moment.",
  },
};

export const Small: Story = {
  args: {
    icon: Search,
    title: "No results",
    description: "Try adjusting your search criteria.",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    icon: Users,
    title: "No learners yet",
    description: "Add your first learner to get started.",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    icon: Calendar,
    title: "No lessons scheduled",
    description: "Your calendar is empty. Start by scheduling a lesson.",
    size: "lg",
  },
};

export const WithAction: Story = {
  args: {
    icon: Users,
    title: "No learners yet",
    description: "Add your first learner to start managing their lessons and progress.",
    action: <Button leftIcon={Plus}>Add Learner</Button>,
  },
};

export const NoLessons: Story = {
  render: () => (
    <EmptyState
      icon={Calendar}
      title="No lessons today"
      description="You don't have any lessons scheduled for today. Enjoy your day off!"
      action={
        <Button variant="outline">View Week</Button>
      }
    />
  ),
};

export const NoSearchResults: Story = {
  render: () => (
    <EmptyState
      icon={Search}
      title="No results found"
      description="We couldn't find any learners matching 'John'. Try a different search term."
      size="sm"
    />
  ),
};

export const NoPayments: Story = {
  render: () => (
    <EmptyState
      icon={CreditCard}
      title="No payments yet"
      description="Payments will appear here once your learners start paying for lessons."
      action={
        <Button leftIcon={Plus}>Create Invoice</Button>
      }
    />
  ),
};

export const EmptyInbox: Story = {
  render: () => (
    <EmptyState
      icon={FileText}
      title="All caught up!"
      description="You've reviewed all pending items. Great job staying on top of things!"
      size="md"
    />
  ),
};
