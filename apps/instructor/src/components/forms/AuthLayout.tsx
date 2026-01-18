"use client";

import { Box, Button, Card, CardBody, Heading, Text, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="bg.subtle"
      px={4}
    >
      <Card maxW="md" w="full">
        <CardBody p={8}>
          <VStack spacing={6}>
            <VStack spacing={2} textAlign="center">
              <Heading size="lg">{title}</Heading>
              <Text color="text.muted">{subtitle}</Text>
            </VStack>

            {children}

            {footer && (
              <Text fontSize="sm" color="text.muted">
                {footer}
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
