"use client";

import { forwardRef } from "react";
import {
  Checkbox as ChakraCheckbox,
  type CheckboxProps as ChakraCheckboxProps,
} from "@chakra-ui/react";

export interface CheckboxProps extends ChakraCheckboxProps {
  /** Size of the checkbox */
  size?: "sm" | "md" | "lg";
  /** Label text */
  label?: string;
}

/**
 * Checkbox is a styled checkbox component.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ size = "md", label, children, ...props }, ref) => {
    return (
      <ChakraCheckbox ref={ref} size={size} {...props}>
        {label || children}
      </ChakraCheckbox>
    );
  }
);

Checkbox.displayName = "Checkbox";
