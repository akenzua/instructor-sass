import type { Meta, StoryObj } from "@storybook/react";
import { AlertBanner, Button, VStack } from "@acme/ui";

const meta: Meta<typeof AlertBanner> = {
  title: "Feedback/AlertBanner",
  component: AlertBanner,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["info", "success", "warning", "error"],
    },
    variant: {
      control: "select",
      options: ["subtle", "left-accent", "solid"],
    },
    isDismissible: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AlertBanner>;

export const Default: Story = {
  args: {
    title: "Information",
    description: "This is an informational message.",
    status: "info",
  },
};

export const Info: Story = {
  args: {
    title: "New Feature Available",
    description: "You can now schedule recurring lessons directly from the calendar.",
    status: "info",
  },
};

export const Success: Story = {
  args: {
    title: "Lesson Booked",
    description: "The lesson has been successfully scheduled and the learner has been notified.",
    status: "success",
  },
};

export const Warning: Story = {
  args: {
    title: "License Expiring Soon",
    description: "Your ADI license expires in 30 days. Remember to renew it.",
    status: "warning",
  },
};

export const Error: Story = {
  args: {
    title: "Payment Failed",
    description: "We couldn't process the payment. Please check your card details.",
    status: "error",
  },
};

export const LeftAccent: Story = {
  args: {
    title: "Reminder",
    description: "You have 3 lessons scheduled for tomorrow.",
    status: "info",
    variant: "left-accent",
  },
};

export const Solid: Story = {
  args: {
    title: "System Update",
    description: "The system will be undergoing maintenance tonight at 11 PM.",
    status: "info",
    variant: "solid",
  },
};

export const Dismissible: Story = {
  args: {
    title: "Tip",
    description: "You can drag and drop lessons to reschedule them quickly.",
    status: "info",
    isDismissible: true,
  },
};

export const WithAction: Story = {
  args: {
    title: "Outstanding Payment",
    description: "John Smith has an outstanding balance of £45.",
    status: "warning",
    actions: (
      <>
        <Button size="sm" variant="outline">View Details</Button>
        <Button size="sm">Send Reminder</Button>
      </>
    ),
  },
};

export const AllStatuses: Story = {
  render: () => (
    <VStack spacing={4} align="stretch">
      <AlertBanner
        status="info"
        title="Info Alert"
        description="This is an informational message with helpful tips."
      />
      <AlertBanner
        status="success"
        title="Success Alert"
        description="Your action was completed successfully."
      />
      <AlertBanner
        status="warning"
        title="Warning Alert"
        description="Please review this before proceeding."
      />
      <AlertBanner
        status="error"
        title="Error Alert"
        description="Something went wrong. Please try again."
      />
    </VStack>
  ),
};
