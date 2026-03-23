"use client";

import { useQuery } from "@tanstack/react-query";
import { lessonsApi, learnersApi, availabilityApi, packagesApi, syllabusApi, notificationsApi } from "@/lib/api";
import type { LessonQuery } from "@acme/shared";

export function useLessons(params?: LessonQuery) {
  return useQuery({
    queryKey: ["lessons", params],
    queryFn: () => lessonsApi.getAll(params),
    enabled: true,
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ["lesson", id],
    queryFn: () => lessonsApi.getById(id),
    enabled: !!id,
  });
}

export function useLessonStats() {
  return useQuery({
    queryKey: ["lessons", "stats"],
    queryFn: () => lessonsApi.getStats(),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["lessons", "stats", "dashboard"],
    queryFn: () => lessonsApi.getDashboardStats(),
    staleTime: 60_000, // 1 minute
    refetchInterval: 5 * 60_000, // refresh every 5 min
  });
}

export function useLearners(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["learners", params],
    queryFn: () => learnersApi.getAll(params),
  });
}

export function useLearner(id: string) {
  return useQuery({
    queryKey: ["learner", id],
    queryFn: () => learnersApi.getById(id),
    enabled: !!id,
  });
}

// Availability queries
export function useWeeklyAvailability() {
  return useQuery({
    queryKey: ["availability", "weekly"],
    queryFn: () => availabilityApi.getWeekly(),
    staleTime: 0, // Always refetch to ensure fresh data
  });
}

export function useAvailabilityOverrides(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["availability", "overrides", params],
    queryFn: () => availabilityApi.getOverrides(params),
  });
}

// Package queries
export function usePackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: () => packagesApi.getAll(),
  });
}

export function useActivePackages() {
  return useQuery({
    queryKey: ["packages", "active"],
    queryFn: () => packagesApi.getActive(),
  });
}

export function usePackage(id: string) {
  return useQuery({
    queryKey: ["package", id],
    queryFn: () => packagesApi.getById(id),
    enabled: !!id,
  });
}

// Syllabus queries
export function useSyllabuses() {
  return useQuery({
    queryKey: ["syllabuses"],
    queryFn: () => syllabusApi.getAll(),
  });
}

export function useDefaultSyllabus() {
  return useQuery({
    queryKey: ["syllabus", "default"],
    queryFn: () => syllabusApi.getDefault(),
  });
}

export function useSyllabus(id: string) {
  return useQuery({
    queryKey: ["syllabus", id],
    queryFn: () => syllabusApi.getById(id),
    enabled: !!id,
  });
}

export function useLearnerProgress(learnerId: string) {
  return useQuery({
    queryKey: ["learner-progress", learnerId],
    queryFn: () => syllabusApi.getProgress(learnerId),
    enabled: !!learnerId,
  });
}

// Notification queries
export function useNotifications(opts?: { unreadOnly?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ["notifications", opts],
    queryFn: () => notificationsApi.getAll(opts),
    refetchInterval: 30_000, // poll every 30 seconds
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30_000,
  });
}

export function useTestReadiness(learnerId: string) {
  return useQuery({
    queryKey: ["test-readiness", learnerId],
    queryFn: () => learnersApi.getTestReadiness(learnerId),
    enabled: !!learnerId,
  });
}
