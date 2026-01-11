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
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authApi.signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      // Store the token (API returns accessToken)
      localStorage.setItem("token", response.accessToken);
      
      toast({
        title: "Account created!",
        description: "Welcome to the Instructor Portal",
        status: "success",
        duration: 3000,
      });
      
      // Force full page reload to update auth state
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Signup failed",
        description:
          error instanceof Error ? error.message : "Could not create account",
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
              <Heading size="lg">Create Account</Heading>
              <Text color="text.muted">Join as an instructor</Text>
            </VStack>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <Stack spacing={4}>
                <Stack direction="row" spacing={4}>
                  <FormControl isInvalid={!!errors.firstName}>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                    />
                    <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.lastName}>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                    />
                    <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                  </FormControl>
                </Stack>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="primary"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                >
                  Create Account
                </Button>
              </Stack>
            </form>

            <Text fontSize="sm" color="text.muted">
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--chakra-colors-primary-500)", fontWeight: 500 }}>
                Sign in
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
