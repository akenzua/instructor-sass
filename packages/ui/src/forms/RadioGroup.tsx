"use client";

import {
  RadioGroup as ChakraRadioGroup,
  Radio,
  Stack,
  type RadioGroupProps as ChakraRadioGroupProps,
} from "@chakra-ui/react";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends Omit<ChakraRadioGroupProps, "children"> {
  /** Radio options */
  options: RadioOption[];
  /** Direction of the radio group */
  direction?: "row" | "column";
  /** Spacing between radio options */
  spacing?: number | string;
  /** Size of the radio buttons */
  size?: "sm" | "md" | "lg";
}

/**
 * RadioGroup is a styled radio button group component.
 */
export function RadioGroup({
  options,
  direction = "column",
  spacing = 3,
  size = "md",
  ...props
}: RadioGroupProps) {
  return (
    <ChakraRadioGroup {...props}>
      <Stack direction={direction} spacing={spacing}>
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            isDisabled={option.disabled}
            size={size}
          >
            {option.label}
          </Radio>
        ))}
      </Stack>
    </ChakraRadioGroup>
  );
}

RadioGroup.displayName = "RadioGroup";
