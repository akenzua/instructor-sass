"use client";

import { forwardRef } from "react";
import {
  Switch as ChakraSwitch,
  type SwitchProps as ChakraSwitchProps,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

export interface SwitchProps extends ChakraSwitchProps {
  /** Size of the switch */
  size?: "sm" | "md" | "lg";
  /** Label text */
  label?: string;
  /** Position of the label */
  labelPosition?: "left" | "right";
}

/**
 * Switch is a styled toggle switch component.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ size = "md", label, labelPosition = "right", id, ...props }, ref) => {
    if (!label) {
      return <ChakraSwitch ref={ref} size={size} id={id} {...props} />;
    }

    return (
      <FormControl display="flex" alignItems="center">
        {labelPosition === "left" && (
          <FormLabel htmlFor={id} mb="0" mr={3} cursor="pointer">
            {label}
          </FormLabel>
        )}
        <ChakraSwitch ref={ref} size={size} id={id} {...props} />
        {labelPosition === "right" && (
          <FormLabel htmlFor={id} mb="0" ml={3} cursor="pointer">
            {label}
          </FormLabel>
        )}
      </FormControl>
    );
  }
);

Switch.displayName = "Switch";
