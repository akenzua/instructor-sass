"use client";

import { useToast as useChakraToast } from "@chakra-ui/react";
import { useCallback } from "react";

export type ToastStatus = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title: string;
  description?: string;
  status?: ToastStatus;
  duration?: number;
  isClosable?: boolean;
}

const defaultDurations: Record<ToastStatus, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
};

/**
 * useToast provides a simplified interface for showing toast notifications.
 */
export function useToast() {
  const chakraToast = useChakraToast();

  const toast = useCallback(
    (options: ToastOptions) => {
      const {
        title,
        description,
        status = "info",
        duration = defaultDurations[status],
        isClosable = true,
      } = options;

      return chakraToast({
        title,
        description,
        status,
        duration,
        isClosable,
        position: "top-right",
        variant: "subtle",
      });
    },
    [chakraToast]
  );

  const success = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, status: "success" });
    },
    [toast]
  );

  const error = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, status: "error" });
    },
    [toast]
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, status: "warning" });
    },
    [toast]
  );

  const info = useCallback(
    (title: string, description?: string) => {
      return toast({ title, description, status: "info" });
    },
    [toast]
  );

  const closeAll = useCallback(() => {
    chakraToast.closeAll();
  }, [chakraToast]);

  return {
    toast,
    success,
    error,
    warning,
    info,
    closeAll,
  };
}
