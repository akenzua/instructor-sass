"use client";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Flex,
  Box,
  type AlertProps,
} from "@chakra-ui/react";

export interface AlertBannerProps extends Omit<AlertProps, "status"> {
  /** Title of the alert */
  title?: string;
  /** Description/message of the alert */
  description?: React.ReactNode;
  /** Status/type of the alert */
  status?: "info" | "success" | "warning" | "error";
  /** Visual style variant */
  variant?: "subtle" | "left-accent" | "solid";
  /** Whether the alert can be dismissed */
  isDismissible?: boolean;
  /** Callback when the alert is dismissed */
  onDismiss?: () => void;
  /** Actions to display (buttons, links) */
  actions?: React.ReactNode;
}

/**
 * AlertBanner displays an alert message with optional title, description, and actions.
 */
export function AlertBanner({
  title,
  description,
  status = "info",
  variant = "subtle",
  isDismissible = false,
  onDismiss,
  actions,
  ...props
}: AlertBannerProps) {
  return (
    <Alert status={status} variant={variant} borderRadius="md" {...props}>
      <AlertIcon />
      <Box flex="1">
        {title && (
          <AlertTitle mr={2} fontWeight="semibold">
            {title}
          </AlertTitle>
        )}
        {description && <AlertDescription>{description}</AlertDescription>}
        {actions && (
          <Flex mt={2} gap={2}>
            {actions}
          </Flex>
        )}
      </Box>
      {isDismissible && (
        <CloseButton
          alignSelf="flex-start"
          position="relative"
          right={-1}
          top={-1}
          onClick={onDismiss}
        />
      )}
    </Alert>
  );
}

AlertBanner.displayName = "AlertBanner";
