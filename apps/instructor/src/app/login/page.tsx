"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        status: "success",
        duration: 3000,
      });
      // Force full page reload to ensure auth state is loaded
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error instanceof Error ? error.message : "Invalid credentials",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              <Heading size="lg">Instructor Portal</Heading>
              <Text color="text.muted">Sign in to manage your lessons</Text>
            </VStack>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="primary"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                >
                  Sign In
                </Button>
              </Stack>
            </form>

            <Text fontSize="sm" color="text.muted">
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={{ color: "var(--chakra-colors-primary-500)", fontWeight: 500 }}>
                Sign up
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
