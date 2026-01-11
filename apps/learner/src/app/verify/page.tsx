"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Card,
  CardBody,
  Heading,
  Spinner,
  Text,
  VStack,
  Button,
  Alert,
  AlertIcon,
  Input,
  FormControl,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { CheckCircle, XCircle, User } from "lucide-react";
import { useLearnerAuth } from "@/lib/auth";
import { authApi } from "@/lib/api";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyMagicLink, learner } = useLearnerAuth();
  const [status, setStatus] = useState<"loading" | "success" | "needsProfile" | "savingProfile" | "error">("loading");
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setError("No verification token provided");
      return;
    }

    const verify = async () => {
      try {
        // Demo mode: accept demo token
        if (token === "demo-learner-token") {
          localStorage.setItem("learner_token", "demo_jwt_token");
          setStatus("success");
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
          return;
        }

        await verifyMagicLink(token);
        // After verification, check if we have the learner's name
        // The learner state will update after verifyMagicLink completes
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError("Invalid or expired token. Please request a new magic link.");
      }
    };

    verify();
  }, [searchParams, verifyMagicLink]);

  // Check if learner needs to complete profile after successful verification
  useEffect(() => {
    if (status === "success" && learner) {
      if (!learner.firstName || !learner.lastName) {
        // Learner needs to complete their profile
        setStatus("needsProfile");
      } else {
        // Learner has complete profile, redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    }
  }, [status, learner]);

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      return;
    }

    setStatus("savingProfile");
    try {
      await authApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setStatus("success");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      setStatus("needsProfile");
      setError("Failed to save profile. Please try again.");
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
          {status === "loading" && (
            <VStack spacing={6} textAlign="center">
              <Spinner size="xl" color="primary.500" thickness="4px" />
              <VStack spacing={2}>
                <Heading size="md">Verifying...</Heading>
                <Text color="text.muted">Please wait while we sign you in</Text>
              </VStack>
            </VStack>
          )}

          {status === "needsProfile" && (
            <VStack spacing={6}>
              <Box
                p={4}
                bg="primary.100"
                borderRadius="full"
                color="primary.500"
                _dark={{ bg: "primary.900", color: "primary.200" }}
              >
                <User size={48} />
              </Box>
              <VStack spacing={2} textAlign="center">
                <Heading size="md">Complete Your Profile</Heading>
                <Text color="text.muted">Please enter your name to continue</Text>
              </VStack>
              
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">{error}</Text>
                </Alert>
              )}

              <VStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FormControl>
                <Button
                  colorScheme="primary"
                  w="full"
                  onClick={handleSaveProfile}
                  isDisabled={!firstName.trim() || !lastName.trim()}
                >
                  Continue
                </Button>
              </VStack>
            </VStack>
          )}

          {status === "savingProfile" && (
            <VStack spacing={6} textAlign="center">
              <Spinner size="xl" color="primary.500" thickness="4px" />
              <VStack spacing={2}>
                <Heading size="md">Saving Profile...</Heading>
                <Text color="text.muted">Please wait</Text>
              </VStack>
            </VStack>
          )}

          {status === "success" && (
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
                <Heading size="md">You&apos;re signed in!</Heading>
                <Text color="text.muted">Redirecting to your dashboard...</Text>
              </VStack>
            </VStack>
          )}

          {status === "error" && (
            <VStack spacing={6} textAlign="center">
              <Box
                p={4}
                bg="red.100"
                borderRadius="full"
                color="red.500"
                _dark={{ bg: "red.900", color: "red.200" }}
              >
                <XCircle size={48} />
              </Box>
              <VStack spacing={2}>
                <Heading size="md">Verification Failed</Heading>
                <Text color="text.muted">{error}</Text>
              </VStack>
              <Button
                colorScheme="primary"
                onClick={() => router.push("/login")}
              >
                Request New Link
              </Button>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Demo: Use /verify?token=demo-learner-token
                </Text>
              </Alert>
            </VStack>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
