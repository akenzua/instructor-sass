"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";

export function useLearnerProfile(enabled: boolean) {
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["learner", "profile"],
    queryFn: authApi.me,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return { profile, isLoading, error, refetch };
}
