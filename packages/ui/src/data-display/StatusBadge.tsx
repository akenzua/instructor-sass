"use client";

import { Badge, type BadgeProps } from "@chakra-ui/react";

export type StatusType =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "pending"
  | "active"
  | "inactive"
  | "completed"
  | "cancelled"
  | "scheduled"
  | "in-progress"
  | "no-show";

export interface StatusBadgeProps extends Omit<BadgeProps, "colorScheme"> {
  /** Status type */
  status: StatusType;
  /** Label text (defaults to status name) */
  label?: string;
  /** Size variant */
  size?: "sm" | "md";
}

const statusConfig: Record<
  StatusType,
  { colorScheme: string; label: string }
> = {
  success: { colorScheme: "green", label: "Success" },
  warning: { colorScheme: "yellow", label: "Warning" },
  error: { colorScheme: "red", label: "Error" },
  info: { colorScheme: "blue", label: "Info" },
  neutral: { colorScheme: "gray", label: "Neutral" },
  pending: { colorScheme: "yellow", label: "Pending" },
  active: { colorScheme: "green", label: "Active" },
  inactive: { colorScheme: "gray", label: "Inactive" },
  completed: { colorScheme: "green", label: "Completed" },
  cancelled: { colorScheme: "red", label: "Cancelled" },
  scheduled: { colorScheme: "blue", label: "Scheduled" },
  "in-progress": { colorScheme: "teal", label: "In Progress" },
  "no-show": { colorScheme: "orange", label: "No Show" },
};

/**
 * StatusBadge displays a status indicator with appropriate styling.
 */
export function StatusBadge({
  status,
  label,
  size = "md",
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.neutral;
  const displayLabel = label || config.label;

  return (
    <Badge
      colorScheme={config.colorScheme}
      variant="subtle"
      fontSize={size === "sm" ? "xs" : "sm"}
      px={size === "sm" ? 1.5 : 2}
      py={size === "sm" ? 0.5 : 0.5}
      borderRadius="md"
      textTransform="none"
      fontWeight="medium"
      {...props}
    >
      {displayLabel}
    </Badge>
  );
}

StatusBadge.displayName = "StatusBadge";
