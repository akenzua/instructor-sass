"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  Heading,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { AuthLayout } from "@/components/forms";

export default function InvitationPage() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "needs-signup" | "accepted" | "error">("loading");
  const [invitationInfo, setInvitationInfo] = useState<{
    schoolName?: string;
    email?: string;
    role?: string;
  }>({});

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const accept = async () => {
      try {
        const result = await authApi.acceptInvitation(token);

        if (result.status === "accepted") {
          // User was logged in and accepted
          localStorage.setItem("token", result.accessToken);
          toast({
            title: "Invitation accepted!",
            description: `You have joined the school`,
            status: "success",
            duration: 3000,
          });
          window.location.href = "/";
        } else if (result.status === "needs-signup") {
          // User needs to create an account first
          setInvitationInfo({
            schoolName: result.schoolName,
            email: result.email,
            role: result.role,
          });
          setStatus("needs-signup");
        }
      } catch {
        setStatus("error");
      }
    };

    accept();
  }, [token, toast]);

  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="No invitation token found">
        <Text>This invitation link is invalid or has expired.</Text>
        <Button as={Link} href="/login" colorScheme="primary" mt={4}>
          Go to Login
        </Button>
      </AuthLayout>
    );
  }

  if (status === "loading") {
    return (
      <AuthLayout title="Processing Invitation" subtitle="Please wait...">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Verifying your invitation...</Text>
        </VStack>
      </AuthLayout>
    );
  }

  if (status === "error") {
    return (
      <AuthLayout title="Invitation Error" subtitle="Something went wrong">
        <VStack spacing={4}>
          <Text>This invitation may have expired or already been used.</Text>
          <Button as={Link} href="/login" colorScheme="primary">
            Go to Login
          </Button>
        </VStack>
      </AuthLayout>
    );
  }

  // needs-signup
  return (
    <AuthLayout
      title="School Invitation"
      subtitle={`Join ${invitationInfo.schoolName || "a driving school"}`}
    >
      <VStack spacing={4} w="full">
        <Card w="full">
          <CardBody>
            <VStack spacing={3} align="start">
              <Heading size="sm">You&apos;ve been invited!</Heading>
              <Text>
                <strong>{invitationInfo.schoolName}</strong> wants you to join as{" "}
                {invitationInfo.role === "admin" ? "an admin" : "an instructor"}.
              </Text>
              <Text fontSize="sm" color="text.muted">
                Create an account or sign in to accept this invitation.
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Button
          as={Link}
          href={`/signup?invitation=${token}&email=${encodeURIComponent(invitationInfo.email || "")}`}
          colorScheme="primary"
          size="lg"
          width="full"
        >
          Create Account & Join
        </Button>

        <Button
          as={Link}
          href={`/login?invitation=${token}`}
          variant="outline"
          size="lg"
          width="full"
        >
          Sign In & Join
        </Button>
      </VStack>
    </AuthLayout>
  );
}
