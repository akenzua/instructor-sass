"use client";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
} from "@chakra-ui/react";

export function PaymentAlert() {
  return (
    <Alert status="warning" borderRadius="lg">
      <AlertIcon />
      <Box>
        <AlertTitle fontSize="sm">Payment Required</AlertTitle>
        <AlertDescription fontSize="xs">
          Please settle your outstanding balance to continue booking lessons.
        </AlertDescription>
      </Box>
    </Alert>
  );
}
