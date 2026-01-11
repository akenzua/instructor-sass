import type { Meta, StoryObj } from "@storybook/react";
import { DataTable, StatusBadge, Button, Text } from "@acme/ui";
import type { Column } from "@acme/ui";
import { Plus } from "lucide-react";

const meta: Meta<typeof DataTable> = {
  title: "Data Display/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  argTypes: {
    striped: {
      control: "boolean",
    },
  },
};

export default meta;

interface Learner {
  id: string;
  name: string;
  email: string;
  lessons: number;
  status: "active" | "inactive" | "pending";
  nextLesson: string;
}

const learners: Learner[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    lessons: 12,
    status: "active",
    nextLesson: "Tomorrow, 10:00 AM",
  },
  {
    id: "2",
    name: "Emma Wilson",
    email: "emma@example.com",
    lessons: 8,
    status: "active",
    nextLesson: "Jan 20, 2:00 PM",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael@example.com",
    lessons: 15,
    status: "pending",
    nextLesson: "Pending scheduling",
  },
  {
    id: "4",
    name: "Sarah Davis",
    email: "sarah@example.com",
    lessons: 5,
    status: "inactive",
    nextLesson: "-",
  },
  {
    id: "5",
    name: "James Miller",
    email: "james@example.com",
    lessons: 20,
    status: "active",
    nextLesson: "Jan 18, 9:00 AM",
  },
];

const columns: Column<Learner>[] = [
  {
    id: "name",
    header: "Name",
    accessor: (row) => (
      <Text fontWeight="medium">{row.name}</Text>
    ),
  },
  {
    id: "email",
    header: "Email",
    accessor: (row) => row.email,
  },
  {
    id: "lessons",
    header: "Lessons",
    accessor: (row) => row.lessons,
    align: "center",
    width: "100px",
  },
  {
    id: "status",
    header: "Status",
    accessor: (row) => <StatusBadge status={row.status} />,
    width: "120px",
  },
  {
    id: "nextLesson",
    header: "Next Lesson",
    accessor: (row) => row.nextLesson,
  },
];

type Story = StoryObj<typeof DataTable<Learner>>;

export const Default: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={learners}
      keyAccessor={(row) => row.id}
    />
  ),
};

export const Striped: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={learners}
      keyAccessor={(row) => row.id}
      striped
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      keyAccessor={(row) => row.id}
      emptyTitle="No learners found"
      emptyDescription="You haven't added any learners yet."
      emptyAction={<Button leftIcon={Plus}>Add Learner</Button>}
    />
  ),
};

export const Clickable: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={learners}
      keyAccessor={(row) => row.id}
      onRowClick={(row) => alert(`Clicked: ${row.name}`)}
    />
  ),
};

export const WithSelection: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={learners}
      keyAccessor={(row) => row.id}
      onRowClick={(row) => console.log("Selected:", row.id)}
      selectedRowKey="2"
    />
  ),
};

// Lessons table example
interface Lesson {
  id: string;
  date: string;
  time: string;
  learner: string;
  type: string;
  status: "scheduled" | "completed" | "cancelled";
}

const lessons: Lesson[] = [
  { id: "1", date: "Jan 15", time: "10:00 AM", learner: "John Smith", type: "Standard", status: "completed" },
  { id: "2", date: "Jan 15", time: "2:00 PM", learner: "Emma Wilson", type: "Extended", status: "completed" },
  { id: "3", date: "Jan 16", time: "9:00 AM", learner: "James Miller", type: "Mock Test", status: "scheduled" },
  { id: "4", date: "Jan 16", time: "11:00 AM", learner: "Sarah Davis", type: "Standard", status: "cancelled" },
];

const lessonColumns: Column<Lesson>[] = [
  { id: "date", header: "Date", accessor: (row) => row.date },
  { id: "time", header: "Time", accessor: (row) => row.time },
  { id: "learner", header: "Learner", accessor: (row) => <Text fontWeight="medium">{row.learner}</Text> },
  { id: "type", header: "Type", accessor: (row) => row.type },
  { id: "status", header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
];

export const LessonsTable: Story = {
  render: () => (
    <DataTable
      columns={lessonColumns}
      data={lessons}
      keyAccessor={(row) => row.id}
    />
  ),
};
