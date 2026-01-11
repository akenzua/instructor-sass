"use client";

import { useQuery } from "@tanstack/react-query";
import { lessonsApi, learnersApi, availabilityApi, packagesApi } from "@/lib/api";
import type { LessonQuery } from "@acme/shared";

export function useLessons(params?: LessonQuery) {
  return useQuery({
    queryKey: ["lessons", params],
    queryFn: () => lessonsApi.getAll(params),
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
