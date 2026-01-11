import type { Meta, StoryObj } from "@storybook/react";
import { TimePickerField, FormField, HStack } from "@acme/ui";
import { useState } from "react";

const meta: Meta<typeof TimePickerField> = {
  title: "Form/TimePickerField",
  component: TimePickerField,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    format: {
      control: "select",
      options: ["12h", "24h"],
    },
    interval: {
      control: "number",
    },
    isDisabled: {
      control: "boolean",
    },
    isInvalid: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TimePickerField>;

export const Default: Story = {
  args: {
    placeholder: "Select time",
  },
};

export const Format12Hour: Story = {
  args: {
    placeholder: "Select time",
    format: "12h",
  },
};

export const Format24Hour: Story = {
  args: {
    placeholder: "Select time",
    format: "24h",
  },
};

export const Interval15: Story = {
  args: {
    placeholder: "15 min intervals",
    interval: 15,
  },
};

export const Interval60: Story = {
  args: {
    placeholder: "1 hour intervals",
    interval: 60,
  },
};

export const BusinessHours: Story = {
  args: {
    placeholder: "Select time",
    startTime: "08:00",
    endTime: "18:00",
    interval: 30,
  },
};

export const Small: Story = {
  args: {
    placeholder: "Small",
    size: "sm",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled",
    isDisabled: true,
  },
};

export const Invalid: Story = {
  args: {
    placeholder: "Invalid",
    isInvalid: true,
  },
};

export const WithFormField: Story = {
  render: () => (
    <FormField
      label="Lesson Time"
      helperText="Select your preferred lesson time"
      isRequired
    >
      <TimePickerField
        placeholder="Select time"
        startTime="07:00"
        endTime="20:00"
        interval={30}
      />
    </FormField>
  ),
};

export const StartAndEndTime: Story = {
  render: () => {
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    
    return (
      <HStack spacing={4}>
        <FormField label="Start Time" isRequired>
          <TimePickerField
            value={startTime}
            onChange={setStartTime}
            placeholder="Start"
            startTime="08:00"
            endTime="17:00"
          />
        </FormField>
        <FormField label="End Time" isRequired>
          <TimePickerField
            value={endTime}
            onChange={setEndTime}
            placeholder="End"
            startTime="09:00"
            endTime="18:00"
          />
        </FormField>
      </HStack>
    );
  },
};
