import type { Meta, StoryObj } from "@storybook/react";
import { Stepper, Button, HStack, Box } from "@acme/ui";
import { useState } from "react";

const meta: Meta<typeof Stepper> = {
  title: "Form/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    allowClickCompleted: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const bookingSteps = [
  { id: "learner", title: "Select Learner" },
  { id: "lesson", title: "Lesson Details" },
  { id: "schedule", title: "Schedule" },
  { id: "confirm", title: "Confirm" },
];

const onboardingSteps = [
  { id: "personal", title: "Personal Info", description: "Basic details" },
  { id: "documents", title: "Documents", description: "License & insurance" },
  { id: "vehicle", title: "Vehicle", description: "Car details" },
  { id: "availability", title: "Availability", description: "Working hours" },
];

export const Default: Story = {
  args: {
    steps: bookingSteps,
    currentStep: 1,
  },
};

export const FirstStep: Story = {
  args: {
    steps: bookingSteps,
    currentStep: 0,
  },
};

export const MiddleStep: Story = {
  args: {
    steps: bookingSteps,
    currentStep: 2,
  },
};

export const LastStep: Story = {
  args: {
    steps: bookingSteps,
    currentStep: 3,
  },
};

export const Vertical: Story = {
  args: {
    steps: onboardingSteps,
    currentStep: 1,
    orientation: "vertical",
  },
};

export const WithDescriptions: Story = {
  args: {
    steps: onboardingSteps,
    currentStep: 2,
  },
};

export const Interactive: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(0);
    
    return (
      <Box maxW="600px">
        <Stepper
          steps={bookingSteps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          mb={6}
        />
        <HStack justify="space-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            isDisabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep((s) => Math.min(bookingSteps.length - 1, s + 1))}
            isDisabled={currentStep === bookingSteps.length - 1}
          >
            Next
          </Button>
        </HStack>
      </Box>
    );
  },
};

export const VerticalInteractive: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(0);
    
    return (
      <HStack align="start" spacing={8}>
        <Stepper
          steps={onboardingSteps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          orientation="vertical"
        />
        <Box p={4} bg="bg.subtle" borderRadius="md" flex={1}>
          <Box mb={4} fontWeight="semibold">
            Step {currentStep + 1}: {onboardingSteps[currentStep].title}
          </Box>
          <HStack>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              isDisabled={currentStep === 0}
            >
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => setCurrentStep((s) => Math.min(onboardingSteps.length - 1, s + 1))}
              isDisabled={currentStep === onboardingSteps.length - 1}
            >
              Continue
            </Button>
          </HStack>
        </Box>
      </HStack>
    );
  },
};
