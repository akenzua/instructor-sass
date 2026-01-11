"use client";

import { forwardRef } from "react";
import {
  Select as ChakraSelect,
  type SelectProps as ChakraSelectProps,
} from "@chakra-ui/react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends ChakraSelectProps {
  /** Visual style variant */
  variant?: "outline" | "filled";
  /** Size of the select */
  size?: "sm" | "md";
  /** Options to display (alternative to children) */
  options?: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Select is a styled dropdown selection component.
 * Supports either `options` prop or children for flexibility.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      variant = "outline",
      size = "md",
      options,
      placeholder,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <ChakraSelect
        ref={ref}
        variant={variant}
        size={size}
        placeholder={placeholder}
        {...props}
      >
        {options
          ? options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))
          : children}
      </ChakraSelect>
    );
  }
);

Select.displayName = "Select";
