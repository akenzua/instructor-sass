"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lessonsApi } from "@/lib/api";

export function useCancellationPreview(lessonId: string | null) {
  return useQuery({
    queryKey: ["learner", "cancel-preview", lessonId],
    queryFn: () => lessonsApi.previewCancellationFee(lessonId!),
    enabled: !!lessonId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCancelLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, reason }: { lessonId: string; reason?: string }) =>
      lessonsApi.cancelLesson(lessonId, reason),
    onSuccess: () => {
      // Invalidate lessons and profile (balance may change)
      queryClient.invalidateQueries({ queryKey: ["learner", "lessons"] });
      queryClient.invalidateQueries({ queryKey: ["learner", "profile"] });
    },
  });
}
