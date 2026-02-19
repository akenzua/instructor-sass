"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardBody, Heading, VStack } from "@chakra-ui/react";
import { Calendar, DollarSign, BookOpen } from "lucide-react";

export function QuickActionsCard() {
  const router = useRouter();

  return (
    <Card>
      <CardBody>
        <Heading size="sm" mb={4}>
          Quick Actions
        </Heading>
        <VStack spacing={3}>
          <Button
            colorScheme="brand"
            w="full"
            leftIcon={<BookOpen size={16} aria-hidden="true" />}
            onClick={() => router.push("/book")}
          >
            Book a Lesson
          </Button>
          <Button
            variant="outline"
            w="full"
            leftIcon={<Calendar size={16} aria-hidden="true" />}
            onClick={() => router.push("/history")}
          >
            View Lesson History
          </Button>
          <Button
            variant="outline"
            w="full"
            leftIcon={<DollarSign size={16} aria-hidden="true" />}
            onClick={() => router.push("/payments")}
          >
            Payment History
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}
