"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonsApi, learnersApi, paymentsApi, availabilityApi, packagesApi, instructorApi, syllabusApi, notificationsApi, type UpdateInstructorData } from "@/lib/api";
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
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      lessonsApi.cancel(id, reason),
    onSuccess: (_, { id }) => {
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

// Instructor profile mutations
export function useUpdateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateInstructorData) => instructorApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useCheckUsername() {
  return useMutation({
    mutationFn: (username: string) => instructorApi.checkUsername(username),
  });
}

// Syllabus mutations
export function useCreateSyllabus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof syllabusApi.create>[0]) => syllabusApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabuses"] });
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
    },
  });
}

export function useUpdateSyllabus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof syllabusApi.update>[1] }) =>
      syllabusApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["syllabuses"] });
      queryClient.invalidateQueries({ queryKey: ["syllabus", id] });
      queryClient.invalidateQueries({ queryKey: ["syllabus", "default"] });
    },
  });
}

export function useDeleteSyllabus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => syllabusApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabuses"] });
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
    },
  });
}

export function useInitProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { learnerId: string; syllabusId?: string }) =>
      syllabusApi.initProgress(data),
    onSuccess: (_, { learnerId }) => {
      queryClient.invalidateQueries({ queryKey: ["learner-progress", learnerId] });
    },
  });
}

export function useScoreTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof syllabusApi.scoreTopic>[0]) =>
      syllabusApi.scoreTopic(data),
    onSuccess: (_, { learnerId, lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ["learner-progress", learnerId] });
      queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
  });
}

export function useCompleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { learnerId: string; topicOrder: number }) =>
      syllabusApi.completeTopic(data),
    onSuccess: (_, { learnerId }) => {
      queryClient.invalidateQueries({ queryKey: ["learner-progress", learnerId] });
    },
  });
}

export function useReopenTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { learnerId: string; topicOrder: number }) =>
      syllabusApi.reopenTopic(data),
    onSuccess: (_, { learnerId }) => {
      queryClient.invalidateQueries({ queryKey: ["learner-progress", learnerId] });
    },
  });
}

// Notification mutations
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// Test readiness mutations
export function useUpdateTestReadiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ learnerId, testReadiness, comment }: {
      learnerId: string;
      testReadiness: 'not-ready' | 'nearly-ready' | 'test-ready';
      comment?: string;
    }) => learnersApi.updateTestReadiness(learnerId, { testReadiness, comment }),
    onSuccess: (_, { learnerId }) => {
      queryClient.invalidateQueries({ queryKey: ["test-readiness", learnerId] });
      queryClient.invalidateQueries({ queryKey: ["learner", learnerId] });
    },
  });
}
