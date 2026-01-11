import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardBody, CardFooter, CardTitle, Button, Text, HStack, Badge } from "@acme/ui";

const meta: Meta<typeof Card> = {
  title: "Layout/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["elevated", "outlined", "filled"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card maxW="400px">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardBody>
        <Text>This is the card body content. It can contain any content you need.</Text>
      </CardBody>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" maxW="400px">
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
      </CardHeader>
      <CardBody>
        <Text>This card has a shadow and appears elevated from the surface.</Text>
      </CardBody>
    </Card>
  ),
};

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined" maxW="400px">
      <CardHeader>
        <CardTitle>Outlined Card</CardTitle>
      </CardHeader>
      <CardBody>
        <Text>This card has a border but no shadow.</Text>
      </CardBody>
    </Card>
  ),
};

export const Filled: Story = {
  render: () => (
    <Card variant="filled" maxW="400px">
      <CardHeader>
        <CardTitle>Filled Card</CardTitle>
      </CardHeader>
      <CardBody>
        <Text>This card has a subtle background fill.</Text>
      </CardBody>
    </Card>
  ),
};

export const BodyOnly: Story = {
  render: () => (
    <Card maxW="400px">
      <CardBody>
        <Text>A simple card with only body content, no header or footer.</Text>
      </CardBody>
    </Card>
  ),
};

export const LessonCard: Story = {
  render: () => (
    <Card maxW="400px">
      <CardHeader>
        <HStack justify="space-between">
          <CardTitle>Driving Lesson</CardTitle>
          <Badge colorScheme="green">Confirmed</Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <Text color="fg.muted" fontSize="sm" mb={2}>
          Thursday, Jan 15, 2024 • 10:00 AM - 11:00 AM
        </Text>
        <Text fontWeight="medium">John Smith</Text>
        <Text fontSize="sm" color="fg.muted">Standard 1-hour lesson</Text>
      </CardBody>
      <CardFooter>
        <HStack spacing={2}>
          <Button size="sm" variant="outline">Reschedule</Button>
          <Button size="sm" variant="ghost" tone="danger">Cancel</Button>
        </HStack>
      </CardFooter>
    </Card>
  ),
};

export const LearnerProfileCard: Story = {
  render: () => (
    <Card maxW="400px">
      <CardHeader>
        <HStack>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: "#13C2C2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
            }}
          >
            JS
          </div>
          <div>
            <CardTitle>John Smith</CardTitle>
            <Text fontSize="sm" color="fg.muted">12 lessons completed</Text>
          </div>
        </HStack>
      </CardHeader>
      <CardBody>
        <Text fontSize="sm">
          <strong>Test Date:</strong> March 15, 2024
        </Text>
        <Text fontSize="sm" mt={1}>
          <strong>Vehicle:</strong> Manual
        </Text>
        <Text fontSize="sm" mt={1}>
          <strong>Progress:</strong> Ready for test
        </Text>
      </CardBody>
      <CardFooter>
        <HStack spacing={2}>
          <Button size="sm">View Profile</Button>
          <Button size="sm" variant="outline">Book Lesson</Button>
        </HStack>
      </CardFooter>
    </Card>
  ),
};
