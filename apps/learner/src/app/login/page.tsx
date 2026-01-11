"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  VStack,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { Mail, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      await authApi.requestMagicLink(email);
      setIsSubmitted(true);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send magic link. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
            <VStack spacing={6} textAlign="center">
              <Box
                p={4}
                bg="green.100"
                borderRadius="full"
                color="green.500"
                _dark={{ bg: "green.900", color: "green.200" }}
              >
                <CheckCircle size={48} />
              </Box>

              <VStack spacing={2}>
                <Heading size="lg">Check your email</Heading>
                <Text color="text.muted">
                  We&apos;ve sent a magic link to
                </Text>
                <Text fontWeight="semibold">{email}</Text>
              </VStack>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Demo Mode</AlertTitle>
                  <AlertDescription fontSize="xs">
                    In production, you would receive an email. For demo,
                    use token: demo-learner-token
                  </AlertDescription>
                </Box>
              </Alert>

              <Button
                variant="link"
                colorScheme="primary"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
              >
                Use a different email
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

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
            <Box
              p={4}
              bg="primary.100"
              borderRadius="full"
              color="primary.500"
              _dark={{ bg: "primary.900", color: "primary.200" }}
            >
              <Mail size={32} />
            </Box>

            <VStack spacing={2} textAlign="center">
              <Heading size="lg">Welcome Back</Heading>
              <Text color="text.muted">
                Enter your email to receive a magic link
              </Text>
            </VStack>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <Stack spacing={4}>
                <FormControl isInvalid={!!error}>
                  <FormLabel>Email address</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    size="lg"
                  />
                  <FormErrorMessage>{error}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="primary"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Sending..."
                >
                  Send Magic Link
                </Button>
              </Stack>
            </form>

            <Text fontSize="sm" color="text.muted" textAlign="center">
              No password needed. We&apos;ll send you a secure link to sign in.
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
