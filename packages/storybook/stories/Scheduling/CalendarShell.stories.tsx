import type { Meta, StoryObj } from "@storybook/react";
import { CalendarShell, Button } from "@acme/ui";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { CalendarView } from "@acme/ui";

const meta: Meta<typeof CalendarShell> = {
  title: "Scheduling/CalendarShell",
  component: CalendarShell,
  tags: ["autodocs"],
  argTypes: {
    view: {
      control: "select",
      options: ["day", "week", "month"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarShell>;

export const Default: Story = {
  args: {
    title: "January 2024",
    view: "week",
    children: (
      <div style={{ padding: "20px", textAlign: "center", color: "#8C8C8C" }}>
        Calendar content goes here
      </div>
    ),
  },
};

export const DayView: Story = {
  args: {
    title: "Monday, January 15",
    view: "day",
    children: (
      <div style={{ padding: "20px", textAlign: "center", color: "#8C8C8C" }}>
        Day view content
      </div>
    ),
  },
};

export const MonthView: Story = {
  args: {
    title: "January 2024",
    view: "month",
    children: (
      <div style={{ padding: "20px", textAlign: "center", color: "#8C8C8C" }}>
        Month view content
      </div>
    ),
  },
};

export const WithActions: Story = {
  args: {
    title: "Week of January 15",
    view: "week",
    actions: <Button leftIcon={Plus} size="sm">New Lesson</Button>,
    children: (
      <div style={{ padding: "20px", textAlign: "center", color: "#8C8C8C" }}>
        Calendar content
      </div>
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [view, setView] = useState<CalendarView>("week");
    const [month, setMonth] = useState(0);
    
    const months = [
      "January 2024",
      "February 2024",
      "March 2024",
    ];
    
    return (
      <CalendarShell
        title={months[month]}
        view={view}
        onViewChange={setView}
        onPrevious={() => setMonth((m) => Math.max(0, m - 1))}
        onNext={() => setMonth((m) => Math.min(2, m + 1))}
        onToday={() => setMonth(0)}
        actions={<Button leftIcon={Plus} size="sm">Block Time</Button>}
      >
        <div style={{
          padding: "40px",
          textAlign: "center",
          color: "#8C8C8C",
          border: "1px dashed #D9D9D9",
          borderRadius: "8px",
        }}>
          <p style={{ marginBottom: "8px" }}>Current view: <strong>{view}</strong></p>
          <p>Showing: {months[month]}</p>
        </div>
      </CalendarShell>
    );
  },
};

export const SingleViewOnly: Story = {
  args: {
    title: "Today's Schedule",
    view: "day",
    viewOptions: ["day"],
    children: (
      <div style={{ padding: "20px", textAlign: "center", color: "#8C8C8C" }}>
        Single view - no view switcher shown
      </div>
    ),
  },
};
