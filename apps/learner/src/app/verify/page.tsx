"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
  FormErrorMessage,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { CheckCircle, XCircle, Calendar, Car, ShieldCheck } from "lucide-react";
import { useLearnerAuth } from "@/lib/auth";
import { authApi } from "@/lib/api";

interface ConfirmedBooking {
  id: string;
  date: string;
  instructorName?: string;
}

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { verifyMagicLink, refreshLearner, learner } = useLearnerAuth();
  const [status, setStatus] = useState<"loading" | "success" | "bookingConfirmed" | "needsProfile" | "savingProfile" | "error">("loading");
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [testDate, setTestDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);
  const [hasVerified, setHasVerified] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setError("No verification token provided");
      return;
    }

    // Prevent double verification (React Strict Mode or re-renders)
    if (hasVerified) {
      return;
    }

    const verify = async () => {
      setHasVerified(true);
      try {
        const result = await verifyMagicLink(token);
        
        // Invalidate all cached queries to ensure fresh data after login
        await queryClient.invalidateQueries();
        
        // Check if this was a booking confirmation
        if (result.confirmedBooking) {
          setConfirmedBooking(result.confirmedBooking);
          setStatus("bookingConfirmed");
        } else {
          setStatus("success");
        }
      } catch (err) {
        setStatus("error");
        setError("Invalid or expired token. Please request a new magic link.");
      }
    };

    verify();
  }, [searchParams, verifyMagicLink, hasVerified]);

  // Check if learner needs to complete profile after successful verification
  useEffect(() => {
    if ((status === "success" || status === "bookingConfirmed") && learner) {
      if (!profileCompleted && (!learner.firstName || !learner.lastName)) {
        // Learner needs to complete their profile
        setStatus("needsProfile");
      } else if (status === "success") {
        // Learner has complete profile, redirect to dashboard
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
      // If bookingConfirmed, stay on the confirmation screen
    }
  }, [status, learner, profileCompleted]);

  const validateClientSide = (): boolean => {
    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";

    if (!dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    } else {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        errors.dateOfBirth = "Invalid date";
      } else {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        if (age < 17) errors.dateOfBirth = "You must be at least 17 years old";
        if (age > 100) errors.dateOfBirth = "Please enter a valid date of birth";
      }
    }

    const cleaned = licenceNumber.toUpperCase().replace(/\s/g, "");
    if (!cleaned) {
      errors.provisionalLicenceNumber = "Provisional licence number is required";
    } else if (cleaned.length !== 16) {
      errors.provisionalLicenceNumber = "UK licence number must be 16 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompleteProfile = async () => {
    if (!validateClientSide()) return;

    setStatus("savingProfile");
    setError("");
    setFieldErrors({});

    try {
      const result = await authApi.completeProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        provisionalLicenceNumber: licenceNumber.toUpperCase().replace(/\s/g, ""),
        ...(testDate ? { testDate } : {}),
      });

      if (!result.success) {
        // Server returned a validation error
        setStatus("needsProfile");
        if (result.field) {
          setFieldErrors({ [result.field]: result.error || "Validation failed" });
        } else {
          setError(result.error || "Verification failed. Please try again.");
        }
        return;
      }

      // Success — mark profile as completed before setting status
      // This prevents the useEffect from flipping back to needsProfile
      setProfileCompleted(true);
      await refreshLearner();
      setStatus("success");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err: any) {
      setStatus("needsProfile");
      const message = err?.response?.data?.message;
      if (Array.isArray(message)) {
        setError(message[0]);
      } else {
        setError(message || "Failed to save profile. Please try again.");
      }
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

          {status === "bookingConfirmed" && confirmedBooking && (
            <VStack spacing={6} textAlign="center">
              <Box
                p={4}
                bg="green.100"
                borderRadius="full"
                color="green.500"
                _dark={{ bg: "green.900", color: "green.200" }}
              >
                <Calendar size={48} />
              </Box>
              <VStack spacing={2}>
                <Heading size="md">Booking Confirmed! 🎉</Heading>
                <Text color="text.muted">
                  Your driving lesson has been successfully booked
                </Text>
              </VStack>
              
              <Box 
                w="full" 
                bg="gray.50" 
                p={4} 
                borderRadius="lg"
                _dark={{ bg: "gray.800" }}
              >
                <VStack spacing={2} align="start">
                  {confirmedBooking.instructorName && (
                    <HStack>
                      <Icon as={Car} boxSize={4} color="primary.500" />
                      <Text fontSize="sm">
                        <strong>Instructor:</strong> {confirmedBooking.instructorName}
                      </Text>
                    </HStack>
                  )}
                  <HStack>
                    <Icon as={Calendar} boxSize={4} color="primary.500" />
                    <Text fontSize="sm">
                      <strong>Date:</strong> {new Date(confirmedBooking.date).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              <Button
                colorScheme="primary"
                w="full"
                onClick={() => router.push("/")}
              >
                Go to My Dashboard
              </Button>
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
                <ShieldCheck size={48} />
              </Box>
              <VStack spacing={2} textAlign="center">
                <Heading size="md">Complete Your Profile</Heading>
                <Text color="text.muted" fontSize="sm">
                  We need to verify your identity before you can book lessons.
                  You must be at least 17 and hold a valid UK provisional licence.
                </Text>
              </VStack>
              
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">{error}</Text>
                </Alert>
              )}

              <VStack spacing={4} w="full">
                <HStack spacing={4} w="full">
                  <FormControl isRequired isInvalid={!!fieldErrors.firstName}>
                    <FormLabel fontSize="sm">First Name</FormLabel>
                    <Input
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, firstName: "" }));
                      }}
                    />
                    <FormErrorMessage>{fieldErrors.firstName}</FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired isInvalid={!!fieldErrors.lastName}>
                    <FormLabel fontSize="sm">Last Name</FormLabel>
                    <Input
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, lastName: "" }));
                      }}
                    />
                    <FormErrorMessage>{fieldErrors.lastName}</FormErrorMessage>
                  </FormControl>
                </HStack>

                <FormControl isRequired isInvalid={!!fieldErrors.dateOfBirth}>
                  <FormLabel fontSize="sm">Date of Birth</FormLabel>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 17)).toISOString().split("T")[0]}
                    onChange={(e) => {
                      setDateOfBirth(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, dateOfBirth: "" }));
                    }}
                  />
                  <FormErrorMessage>{fieldErrors.dateOfBirth}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!fieldErrors.provisionalLicenceNumber}>
                  <FormLabel fontSize="sm">UK Provisional Licence Number</FormLabel>
                  <Input
                    placeholder="e.g. JONES910250J93CW"
                    value={licenceNumber}
                    maxLength={16}
                    onChange={(e) => {
                      setLicenceNumber(e.target.value.toUpperCase());
                      setFieldErrors((prev) => ({ ...prev, provisionalLicenceNumber: "" }));
                    }}
                  />
                  <FormErrorMessage>{fieldErrors.provisionalLicenceNumber}</FormErrorMessage>
                  <Text fontSize="xs" color="text.muted" mt={1}>
                    16-character number found on your provisional driving licence
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Driving Test Date (Optional)</FormLabel>
                  <Input
                    type="date"
                    value={testDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setTestDate(e.target.value);
                    }}
                  />
                  <Text fontSize="xs" color="text.muted" mt={1}>
                    If you have a test booked, enter the date so your instructor can help you prepare
                  </Text>
                </FormControl>

                <Button
                  colorScheme="primary"
                  w="full"
                  onClick={handleCompleteProfile}
                  isDisabled={!firstName.trim() || !lastName.trim() || !dateOfBirth || !licenceNumber.trim()}
                >
                  Verify & Continue
                </Button>
              </VStack>
            </VStack>
          )}

          {status === "savingProfile" && (
            <VStack spacing={6} textAlign="center">
              <Spinner size="xl" color="primary.500" thickness="4px" />
              <VStack spacing={2}>
                <Heading size="md">Verifying Your Details...</Heading>
                <Text color="text.muted">
                  Checking your age and provisional licence
                </Text>
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
