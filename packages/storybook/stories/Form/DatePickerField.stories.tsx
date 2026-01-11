import type { Meta, StoryObj } from "@storybook/react";
import { DatePickerField, FormField } from "@acme/ui";
import { useState } from "react";

const meta: Meta<typeof DatePickerField> = {
  title: "Form/DatePickerField",
  component: DatePickerField,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    isDisabled: {
      control: "boolean",
    },
    isInvalid: {
      control: "boolean",
    },
    isClearable: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DatePickerField>;

export const Default: Story = {
  args: {
    placeholder: "Select a date",
  },
};

export const WithValue: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <DatePickerField
        value={date}
        onChange={setDate}
        placeholder="Select a date"
      />
    );
  },
};

export const Small: Story = {
  args: {
    placeholder: "Small date picker",
    size: "sm",
  },
};

export const NotClearable: Story = {
  args: {
    placeholder: "Cannot be cleared",
    isClearable: false,
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

export const WithMinMaxDates: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    const today = new Date();
    const minDate = today;
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    
    return (
      <FormField
        label="Lesson Date"
        helperText="Select a date within the next 2 months"
      >
        <DatePickerField
          value={date}
          onChange={setDate}
          minDate={minDate}
          maxDate={maxDate}
          placeholder="Select date"
        />
      </FormField>
    );
  },
};

export const CustomFormat: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <DatePickerField
        value={date}
        onChange={setDate}
        dateFormat="dd/MM/yyyy"
        placeholder="DD/MM/YYYY"
      />
    );
  },
};

export const WithFormField: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    return (
      <FormField
        label="Lesson Date"
        helperText="When would you like to book your lesson?"
        isRequired
      >
        <DatePickerField
          value={date}
          onChange={setDate}
          placeholder="Select date"
        />
      </FormField>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <FormField
      label="Lesson Date"
      error="Please select a valid date"
      isRequired
    >
      <DatePickerField
        placeholder="Select date"
        isInvalid
      />
    </FormField>
  ),
};
