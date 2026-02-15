"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Skeleton,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react";
import { CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BalanceCardProps {
  balance: number;
  hasDebt: boolean;
  isLoading: boolean;
}

export function BalanceCard({ balance, hasDebt, isLoading }: BalanceCardProps) {
  const router = useRouter();

  return (
    <Card>
      <CardBody>
        <Heading size="sm" mb={4}>
          Account Balance
        </Heading>
        {isLoading ? (
          <Skeleton height="60px" />
        ) : (
          <>
            <Box
              p={4}
              bg={hasDebt ? "red.50" : "green.50"}
              borderRadius="lg"
              _dark={{
                bg: hasDebt ? "red.900" : "green.900",
              }}
            >
              <Text
                fontSize="3xl"
                fontWeight="bold"
                color={hasDebt ? "red.500" : "green.500"}
              >
                <VisuallyHidden>
                  {hasDebt ? "Outstanding balance: " : "Available credit: "}
                </VisuallyHidden>
                {hasDebt ? "-" : ""}
                {formatCurrency(balance)}
              </Text>
              <Text fontSize="sm" color="text.muted">
                {hasDebt
                  ? "Outstanding balance"
                  : balance > 0
                  ? "Credit available"
                  : "No balance"}
              </Text>
            </Box>

            {hasDebt && (
              <Button
                mt={4}
                colorScheme="primary"
                leftIcon={<CreditCard size={16} aria-hidden="true" />}
                w="full"
                onClick={() => router.push("/pay")}
              >
                Pay Now
              </Button>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
