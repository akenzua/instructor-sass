"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { isFuture, isToday } from "date-fns";
import { lessonsApi } from "@/lib/api";
import type { PopulatedLesson } from "@/types";

export function useUpcomingLessons(enabled: boolean) {
  const {
    data: allLessons,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["learner", "lessons"],
    queryFn: () => lessonsApi.getMyLessons({ status: "scheduled" }),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 minutes
  });

  const lessons = useMemo(
    () =>
      ((allLessons as PopulatedLesson[] | undefined) ?? []).filter((lesson) => {
        const startTime = new Date(lesson.startTime);
        return isFuture(startTime) || isToday(startTime);
      }),
    [allLessons]
  );

  const nextLesson = lessons[0] ?? null;

  return { lessons, nextLesson, isLoading, error, refetch };
}
