"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  HStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { LogOut } from "lucide-react";
import type { Learner } from "@acme/shared";

interface AppHeaderProps {
  profile: Learner | undefined;
  learner: Learner | null;
  onLogout: () => void;
}

export function AppHeader({ profile, learner, onLogout }: AppHeaderProps) {
  const router = useRouter();
  const toast = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      onLogout();
      router.push("/login");
    } catch {
      toast({
        title: "Failed to sign out. Please try again.",
        status: "error",
        duration: 3000,
      });
      setIsLoggingOut(false);
    }
  };

  return (
    <Box
      bg="bg.surface"
      borderBottom="1px solid"
      borderColor="border.subtle"
      px={6}
      py={4}
    >
      <HStack justify="space-between" maxW="container.xl" mx="auto">
        <Text fontSize="lg" fontWeight="bold" color="primary.500">
          Learner Portal
        </Text>
        <HStack spacing={4}>
          <Text fontSize="sm" color="text.muted">
            {profile?.firstName || learner?.firstName}{" "}
            {profile?.lastName || learner?.lastName}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<LogOut size={16} aria-hidden="true" />}
            onClick={handleLogout}
            isLoading={isLoggingOut}
            loadingText="Signing out..."
          >
            Sign Out
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
}
