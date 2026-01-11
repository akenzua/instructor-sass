"use client";

import { Fragment } from "react";
import {
  Box,
  Flex,
  Text,
  Circle,
  Divider,
  type BoxProps,
} from "@chakra-ui/react";
import { Check } from "lucide-react";

export interface Step {
  /** Unique identifier for the step */
  id: string;
  /** Title of the step */
  title: string;
  /** Optional description */
  description?: string;
}

export interface StepperProps extends Omit<BoxProps, "onChange"> {
  /** Array of steps */
  steps: Step[];
  /** Current active step index (0-based) */
  currentStep: number;
  /** Callback when a step is clicked */
  onStepClick?: (index: number) => void;
  /** Orientation of the stepper */
  orientation?: "horizontal" | "vertical";
  /** Whether completed steps are clickable */
  allowClickCompleted?: boolean;
}

/**
 * Stepper component for multi-step flows.
 */
export function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = "horizontal",
  allowClickCompleted = true,
  ...props
}: StepperProps) {
  const isVertical = orientation === "vertical";

  const handleStepClick = (index: number) => {
    if (!onStepClick) return;
    if (index < currentStep && allowClickCompleted) {
      onStepClick(index);
    } else if (index === currentStep) {
      onStepClick(index);
    }
  };

  return (
    <Box {...props}>
      <Flex
        direction={isVertical ? "column" : "row"}
        align={isVertical ? "flex-start" : "center"}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isClickable =
            onStepClick && (isActive || (isCompleted && allowClickCompleted));

          return (
            <Fragment key={step.id}>
              <Flex
                direction={isVertical ? "row" : "column"}
                align={isVertical ? "flex-start" : "center"}
                cursor={isClickable ? "pointer" : "default"}
                onClick={() => handleStepClick(index)}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === "Enter" || e.key === " ")) {
                    handleStepClick(index);
                  }
                }}
                _hover={isClickable ? { opacity: 0.8 } : undefined}
                flex={isVertical ? "none" : 1}
                minW={isVertical ? "auto" : 0}
              >
                <Circle
                  size="8"
                  bg={
                    isCompleted
                      ? "accent.default"
                      : isActive
                      ? "accent.default"
                      : "bg.subtle"
                  }
                  color={isCompleted || isActive ? "white" : "fg.muted"}
                  fontWeight="semibold"
                  fontSize="sm"
                  transition="all 0.2s"
                >
                  {isCompleted ? <Check size={16} /> : index + 1}
                </Circle>
                <Box
                  ml={isVertical ? 3 : 0}
                  mt={isVertical ? 0 : 2}
                  textAlign={isVertical ? "left" : "center"}
                >
                  <Text
                    fontSize="sm"
                    fontWeight={isActive ? "semibold" : "medium"}
                    color={isActive ? "fg.default" : "fg.muted"}
                  >
                    {step.title}
                  </Text>
                  {step.description && (
                    <Text fontSize="xs" color="fg.muted" mt={0.5}>
                      {step.description}
                    </Text>
                  )}
                </Box>
              </Flex>
              {index < steps.length - 1 && (
                <Box
                  flex={isVertical ? "none" : 1}
                  mx={isVertical ? 0 : 2}
                  my={isVertical ? 2 : 0}
                  ml={isVertical ? 4 : 2}
                >
                  <Divider
                    orientation={isVertical ? "vertical" : "horizontal"}
                    h={isVertical ? "8" : "auto"}
                    borderColor={
                      index < currentStep ? "accent.default" : "border.default"
                    }
                    borderWidth="1px"
                  />
                </Box>
              )}
            </Fragment>
          );
        })}
      </Flex>
    </Box>
  );
}

Stepper.displayName = "Stepper";
