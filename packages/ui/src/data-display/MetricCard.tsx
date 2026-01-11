"use client";

import {
  Box,
  Flex,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  type BoxProps,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

export interface MetricCardProps extends Omit<BoxProps, "title"> {
  /** Metric label/title */
  label: string;
  /** Metric value */
  value: string | number;
  /** Optional icon */
  icon?: LucideIcon;
  /** Change value (e.g., "+12%") */
  change?: string;
  /** Whether the change is positive */
  changeType?: "increase" | "decrease";
  /** Help text below the value */
  helpText?: string;
  /** Visual style variant */
  variant?: "elevated" | "outlined";
}

/**
 * MetricCard displays a single metric with optional change indicator.
 */
export function MetricCard({
  label,
  value,
  icon: IconComponent,
  change,
  changeType,
  helpText,
  variant = "elevated",
  ...props
}: MetricCardProps) {
  return (
    <Box
      p={6}
      bg="bg.surface"
      borderRadius="lg"
      boxShadow={variant === "elevated" ? "md" : "none"}
      border={variant === "outlined" ? "1px solid" : "none"}
      borderColor={variant === "outlined" ? "border.default" : undefined}
      {...props}
    >
      <Flex justify="space-between" align="flex-start">
        <Stat>
          <StatLabel color="fg.muted" fontSize="sm" fontWeight="medium">
            {label}
          </StatLabel>
          <StatNumber
            fontSize="3xl"
            fontWeight="bold"
            color="fg.default"
            mt={1}
          >
            {value}
          </StatNumber>
          {(change || helpText) && (
            <StatHelpText mb={0} mt={1}>
              {change && changeType && (
                <StatArrow type={changeType} />
              )}
              {change && (
                <Text
                  as="span"
                  color={
                    changeType === "increase"
                      ? "success.default"
                      : changeType === "decrease"
                      ? "danger.default"
                      : "fg.muted"
                  }
                  fontWeight="medium"
                >
                  {change}
                </Text>
              )}
              {helpText && (
                <Text as="span" color="fg.muted" ml={change ? 1 : 0}>
                  {helpText}
                </Text>
              )}
            </StatHelpText>
          )}
        </Stat>
        {IconComponent && (
          <Box
            p={3}
            bg="accent.subtle"
            borderRadius="lg"
            color="accent.default"
          >
            <IconComponent size={24} />
          </Box>
        )}
      </Flex>
    </Box>
  );
}

MetricCard.displayName = "MetricCard";
