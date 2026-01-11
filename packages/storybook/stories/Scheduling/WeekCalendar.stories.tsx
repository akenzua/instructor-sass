import type { Meta, StoryObj } from "@storybook/react";
import { WeekCalendar, type CalendarEvent } from "@acme/ui";
import { useState } from "react";

const meta: Meta<typeof WeekCalendar> = {
  title: "Scheduling/WeekCalendar",
  component: WeekCalendar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof WeekCalendar>;

// Generate mock events for the current week
const generateMockEvents = (baseDate: Date): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const colors = ["#319795", "#38A169", "#D69E2E", "#E53E3E"];

  for (let i = 0; i < 7; i++) {
    const day = new Date(baseDate);
    day.setDate(baseDate.getDate() - baseDate.getDay() + 1 + i); // Start from Monday

    // Skip weekends for this example
    if (i >= 5) continue;

    // Add 1-2 lessons per day
    const numLessons = Math.floor(Math.random() * 2) + 1;

    for (let j = 0; j < numLessons; j++) {
      const hour = 9 + j * 3 + Math.floor(Math.random() * 2);
      const startTime = new Date(day);
      startTime.setHours(hour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 2);

      events.push({
        id: `event-${i}-${j}`,
        startTime,
        endTime,
        title: ["Emma Wilson", "James Brown", "Sophie Taylor", "Oliver Davies"][
          Math.floor(Math.random() * 4)
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  return events;
};

const WeekCalendarWithState = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const events = generateMockEvents(currentDate);

  return (
    <WeekCalendar
      currentDate={currentDate}
      events={events}
      onDateChange={setCurrentDate}
      onEventClick={(event) => alert(`Clicked: ${event.title}`)}
      onSlotClick={(date, hour) =>
        alert(`Slot clicked: ${date.toDateString()} at ${hour}:00`)
      }
    />
  );
};

export const Default: Story = {
  render: () => <WeekCalendarWithState />,
};

export const Empty: Story = {
  args: {
    currentDate: new Date(),
    events: [],
  },
};

export const WithManyEvents: Story = {
  render: () => {
    const today = new Date();
    const events: CalendarEvent[] = [];

    // Create events for each weekday
    for (let i = 0; i < 5; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - today.getDay() + 1 + i);

      // 3 events per day
      [9, 11, 14].forEach((hour, j) => {
        const startTime = new Date(day);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 2);

        events.push({
          id: `event-${i}-${j}`,
          startTime,
          endTime,
          title: `Lesson ${j + 1}`,
          color: ["#319795", "#38A169", "#D69E2E"][j],
        });
      });
    }

    return (
      <WeekCalendar
        currentDate={today}
        events={events}
        onEventClick={(event) => alert(`Clicked: ${event.title}`)}
      />
    );
  },
};

export const CustomHours: Story = {
  args: {
    currentDate: new Date(),
    events: [],
    startHour: 6,
    endHour: 22,
  },
};
