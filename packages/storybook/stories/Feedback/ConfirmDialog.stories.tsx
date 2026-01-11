import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmDialog, Button, useDisclosure, VStack, Text } from "@acme/ui";
import { useState } from "react";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Feedback/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  argTypes: {
    confirmTone: {
      control: "select",
      options: ["primary", "danger"],
    },
    isLoading: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
  render: () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    return (
      <>
        <Button onClick={onOpen}>Open Dialog</Button>
        <ConfirmDialog
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={onClose}
          title="Confirm Action"
          message="Are you sure you want to proceed with this action?"
        />
      </>
    );
  },
};

export const Danger: Story = {
  render: () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    return (
      <>
        <Button tone="danger" onClick={onOpen}>Delete Lesson</Button>
        <ConfirmDialog
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={onClose}
          title="Delete Lesson"
          message="Are you sure you want to delete this lesson? This action cannot be undone."
          confirmText="Delete"
          confirmTone="danger"
        />
      </>
    );
  },
};

export const CancelLesson: Story = {
  render: () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    return (
      <>
        <Button variant="outline" tone="danger" onClick={onOpen}>
          Cancel Lesson
        </Button>
        <ConfirmDialog
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={onClose}
          title="Cancel Lesson"
          message={
            <VStack align="start" spacing={2}>
              <Text>Are you sure you want to cancel this lesson?</Text>
              <Text fontSize="sm" color="fg.muted">
                • The learner will be notified automatically
              </Text>
              <Text fontSize="sm" color="fg.muted">
                • A cancellation fee may apply if within 24 hours
              </Text>
            </VStack>
          }
          confirmText="Cancel Lesson"
          confirmTone="danger"
          cancelText="Keep Lesson"
        />
      </>
    );
  },
};

export const SaveChanges: Story = {
  render: () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    return (
      <>
        <Button onClick={onOpen}>Save Changes</Button>
        <ConfirmDialog
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={onClose}
          title="Save Changes"
          message="You have unsaved changes. Would you like to save them before leaving?"
          confirmText="Save"
          cancelText="Discard"
        />
      </>
    );
  },
};

export const WithLoading: Story = {
  render: () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLoading, setIsLoading] = useState(false);
    
    const handleConfirm = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      onClose();
    };
    
    return (
      <>
        <Button tone="danger" onClick={onOpen}>Delete Account</Button>
        <ConfirmDialog
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={handleConfirm}
          title="Delete Account"
          message="This will permanently delete your account and all associated data. This action cannot be undone."
          confirmText="Delete Account"
          confirmTone="danger"
          isLoading={isLoading}
        />
      </>
    );
  },
};
