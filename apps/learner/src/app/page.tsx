"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Grid,
  GridItem,
  Skeleton,
  VStack,
} from "@chakra-ui/react";
import { PageHeader } from "@acme/ui";
import { useLearnerAuth } from "@/lib/auth";
import { useLearnerProfile, useUpcomingLessons } from "@/hooks";
import { AppHeader } from "@/components/AppHeader";
import { NextLessonCard } from "@/components/NextLessonCard";
import { UpcomingLessonsCard } from "@/components/UpcomingLessonsCard";
import { BalanceCard } from "@/components/BalanceCard";
import { PaymentAlert } from "@/components/PaymentAlert";
import { QuickActionsCard } from "@/components/QuickActionsCard";

export default function HomePage() {
  const router = useRouter();
  const {
    learner,
    isLoading: authLoading,
    isAuthenticated,
    logout,
  } = useLearnerAuth();

  const { profile, isLoading: profileLoading } = useLearnerProfile(isAuthenticated);
  const {
    lessons,
    nextLesson,
    isLoading: lessonsLoading,
    error: lessonsError,
    refetch: refetchLessons,
  } = useUpcomingLessons(isAuthenticated);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <Box minH="100vh" bg="bg.subtle" p={8}>
        <Skeleton height="400px" />
      </Box>
    );
  }

  const balance = profile?.balance ?? learner?.balance ?? 0;
  const hasDebt = balance < 0;
  const displayName = profile?.firstName || learner?.firstName || "Learner";

  return (
    <Box minH="100vh" bg="bg.subtle">
      <AppHeader profile={profile} learner={learner} onLogout={logout} />

      <Box maxW="container.xl" mx="auto" p={6}>
        <VStack spacing={6} align="stretch">
          <PageHeader
            title={`Welcome, ${displayName}!`}
            description="Here's your upcoming lessons and account status"
          />

          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Main Content */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                <NextLessonCard
                  lesson={nextLesson}
                  isLoading={lessonsLoading}
                  error={lessonsError}
                  onRetry={refetchLessons}
                />
                <UpcomingLessonsCard lessons={lessons} />
              </VStack>
            </GridItem>

            {/* Sidebar */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                <BalanceCard
                  balance={balance}
                  hasDebt={hasDebt}
                  isLoading={profileLoading}
                />
                {hasDebt && <PaymentAlert />}
                <QuickActionsCard />
              </VStack>
            </GridItem>
          </Grid>
        </VStack>
      </Box>
    </Box>
  );
}
