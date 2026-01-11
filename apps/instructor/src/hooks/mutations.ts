"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonsApi, learnersApi, paymentsApi, availabilityApi, packagesApi } from "@/lib/api";
import type { Lesson, Learner, CreateLesson, CreateLearner } from "@acme/shared";

// Lesson mutations
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLesson) =>
      lessonsApi.create(data),
    onSuccess: () => {
      // Invalidate all lesson queries (including filtered ones on calendar)
      queryClient.invalidateQueries({ queryKey: ["lessons"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["lessons", "stats"] });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lesson> }) =>
      lessonsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["lessons"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["lesson", id] });
      queryClient.invalidateQueries({ queryKey: ["lessons", "stats"] });
    },
  });
}

export function useCancelLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lessonsApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["lessons"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["lesson", id] });
      queryClient.invalidateQueries({ queryKey: ["lessons", "stats"] });
    },
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lessonsApi.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["lessons"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["lesson", id] });
      queryClient.invalidateQueries({ queryKey: ["lessons", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["learners"] });
    },
  });
}

// Learner mutations
export function useCreateLearner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLearner) =>
      learnersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learners"] });
    },
  });
}

export function useUpdateLearner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Learner> }) =>
      learnersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["learners"] });
      queryClient.invalidateQueries({ queryKey: ["learner", id] });
    },
  });
}

export function useDeleteLearner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => learnersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learners"] });
    },
  });
}

// Payment mutations
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (data: { learnerId: string; amount: number }) =>
      paymentsApi.createIntent(data),
  });
}

// Availability mutations
export function useUpdateWeeklyAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Array<{
      dayOfWeek: string;
      slots: { start: string; end: string }[];
      isAvailable: boolean;
    }>) => availabilityApi.updateWeekly(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", "weekly"] });
    },
  });
}

export function useCreateAvailabilityOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      date: string;
      slots?: { start: string; end: string }[];
      isAvailable: boolean;
      reason?: string;
    }) => availabilityApi.createOverride(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", "overrides"] });
    },
  });
}

export function useDeleteAvailabilityOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (date: string) => availabilityApi.deleteOverride(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", "overrides"] });
    },
  });
}

// Package mutations
export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      lessonCount: number;
      price: number;
      discountPercent?: number;
      isActive?: boolean;
    }) => packagesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: Partial<{
        name: string;
        description?: string;
        lessonCount: number;
        price: number;
        discountPercent?: number;
        isActive?: boolean;
      }>;
    }) => packagesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["package", id] });
    },
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => packagesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });
}
