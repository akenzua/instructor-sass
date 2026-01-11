import type { Meta, StoryObj } from "@storybook/react";
import { MetricCard, HStack, VStack, Box } from "@acme/ui";
import { Users, Calendar, CreditCard, TrendingUp, Car, Clock } from "lucide-react";

const meta: Meta<typeof MetricCard> = {
  title: "Data Display/MetricCard",
  component: MetricCard,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["elevated", "outlined"],
    },
    changeType: {
      control: "select",
      options: ["increase", "decrease"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof MetricCard>;

export const Default: Story = {
  args: {
    label: "Total Learners",
    value: 42,
  },
};

export const WithIcon: Story = {
  args: {
    label: "Total Learners",
    value: 42,
    icon: Users,
  },
};

export const WithChange: Story = {
  args: {
    label: "Revenue",
    value: "£2,450",
    icon: CreditCard,
    change: "12%",
    changeType: "increase",
    helpText: "vs last month",
  },
};

export const Decrease: Story = {
  args: {
    label: "Cancelled Lessons",
    value: 3,
    change: "25%",
    changeType: "decrease",
    helpText: "vs last week",
  },
};

export const Outlined: Story = {
  args: {
    label: "Active Learners",
    value: 28,
    icon: Users,
    variant: "outlined",
  },
};

export const DashboardMetrics: Story = {
  render: () => (
    <Box>
      <HStack spacing={4} flexWrap="wrap">
        <MetricCard
          label="Total Learners"
          value={42}
          icon={Users}
          change="8%"
          changeType="increase"
          helpText="vs last month"
          flex={1}
          minW="200px"
        />
        <MetricCard
          label="Lessons This Week"
          value={24}
          icon={Calendar}
          change="3"
          changeType="increase"
          helpText="from last week"
          flex={1}
          minW="200px"
        />
        <MetricCard
          label="Revenue"
          value="£1,840"
          icon={CreditCard}
          change="15%"
          changeType="increase"
          helpText="vs last week"
          flex={1}
          minW="200px"
        />
        <MetricCard
          label="Hours Taught"
          value="32h"
          icon={Clock}
          helpText="this week"
          flex={1}
          minW="200px"
        />
      </HStack>
    </Box>
  ),
};

export const WeeklyStats: Story = {
  render: () => (
    <VStack spacing={4} align="stretch">
      <MetricCard
        label="Test Pass Rate"
        value="87%"
        icon={TrendingUp}
        change="5%"
        changeType="increase"
        helpText="vs last quarter"
      />
      <MetricCard
        label="Average Lessons per Learner"
        value="18"
        icon={Car}
        helpText="until test ready"
      />
      <MetricCard
        label="Cancellation Rate"
        value="4%"
        change="2%"
        changeType="decrease"
        helpText="improvement"
      />
    </VStack>
  ),
};
