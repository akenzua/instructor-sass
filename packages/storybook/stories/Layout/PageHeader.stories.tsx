import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader, Button, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@acme/ui";
import { Plus, Download, Filter } from "lucide-react";

const meta: Meta<typeof PageHeader> = {
  title: "Layout/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: "Dashboard",
  },
};

export const WithDescription: Story = {
  args: {
    title: "Learners",
    description: "Manage your students and track their progress",
  },
};

export const WithActions: Story = {
  args: {
    title: "Lessons",
    description: "View and manage scheduled lessons",
    actions: (
      <>
        <Button variant="outline" leftIcon={Filter}>Filter</Button>
        <Button leftIcon={Plus}>New Lesson</Button>
      </>
    ),
  },
};

export const WithBreadcrumbs: Story = {
  render: () => (
    <PageHeader
      title="John Smith"
      description="Learner profile and lesson history"
      breadcrumbs={
        <Breadcrumb fontSize="sm">
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Learners</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">John Smith</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      }
      actions={
        <>
          <Button variant="outline">Edit</Button>
          <Button leftIcon={Plus}>Book Lesson</Button>
        </>
      }
    />
  ),
};

export const DashboardHeader: Story = {
  render: () => (
    <PageHeader
      title="Welcome back, Sarah!"
      description="Here's what's happening with your lessons today"
      actions={
        <Button leftIcon={Download} variant="outline">
          Export Report
        </Button>
      }
    />
  ),
};

export const CalendarHeader: Story = {
  render: () => (
    <PageHeader
      title="Calendar"
      description="Manage your schedule and availability"
      actions={
        <>
          <Button variant="ghost">Today</Button>
          <Button variant="outline">Week View</Button>
          <Button leftIcon={Plus}>Block Time</Button>
        </>
      }
    />
  ),
};
