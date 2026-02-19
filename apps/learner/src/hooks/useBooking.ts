"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { bookingApi } from "@/lib/api";

export function useMyInstructors(enabled: boolean) {
  return useQuery({
    queryKey: ["booking", "my-instructors"],
    queryFn: bookingApi.getMyInstructors,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInstructorAvailability(
  enabled: boolean,
  instructorId?: string,
) {
  return useQuery({
    queryKey: ["booking", "availability", instructorId],
    queryFn: () => bookingApi.getInstructorAvailability(instructorId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInstructorPackages(
  enabled: boolean,
  instructorId?: string,
) {
  return useQuery({
    queryKey: ["booking", "packages", instructorId],
    queryFn: () => bookingApi.getPackages(instructorId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSwitchInstructor() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (instructorId: string) =>
      bookingApi.switchInstructor(instructorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking"] });
      toast({
        title: "Instructor switched",
        description: "Showing availability for the selected instructor.",
        status: "info",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Switch failed",
        description:
          error?.response?.data?.message || "Could not switch instructor.",
        status: "error",
        duration: 5000,
      });
    },
  });
}

export function useBookLesson() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: bookingApi.bookLesson,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["learner"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
      toast({
        title: "Lesson booked!",
        description: `Your lesson has been scheduled. New balance: £${data.newBalance.toFixed(2)}`,
        status: "success",
        duration: 4000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description:
          error?.response?.data?.message || "Could not book the lesson.",
        status: "error",
        duration: 5000,
      });
    },
  });
}

export function useBookPackage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: bookingApi.bookPackage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["learner"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
      toast({
        title: "Package booked!",
        description: `${data.package.name} — ${data.package.lessonCount} lessons added. New balance: £${data.newBalance.toFixed(2)}`,
        status: "success",
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Package booking failed",
        description:
          error?.response?.data?.message || "Could not book the package.",
        status: "error",
        duration: 5000,
      });
    },
  });
}

export function useLinkInstructor() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (instructorId: string) =>
      bookingApi.linkInstructor(instructorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking"] });
      toast({
        title: "Instructor linked!",
        description: "You can now book lessons with this instructor.",
        status: "success",
        duration: 4000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Link failed",
        description:
          error?.response?.data?.message || "Could not link to instructor.",
        status: "error",
        duration: 5000,
      });
    },
  });
}
