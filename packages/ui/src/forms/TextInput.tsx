"use client";

import { forwardRef } from "react";
import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  type InputProps,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

export interface TextInputProps extends InputProps {
  /** Visual style variant */
  variant?: "outline" | "filled";
  /** Size of the input */
  size?: "sm" | "md";
  /** Icon to display on the left */
  leftIcon?: LucideIcon;
  /** Icon to display on the right */
  rightIcon?: LucideIcon;
  /** Element to display on the left (overrides leftIcon) */
  leftElement?: React.ReactNode;
  /** Element to display on the right (overrides rightIcon) */
  rightElement?: React.ReactNode;
}

/**
 * TextInput is a styled text input component.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      variant = "outline",
      size = "md",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      leftElement,
      rightElement,
      ...props
    },
    ref
  ) => {
    const hasLeftContent = !!leftElement || !!LeftIcon;
    const hasRightContent = !!rightElement || !!RightIcon;

    if (!hasLeftContent && !hasRightContent) {
      return <Input ref={ref} variant={variant} size={size} {...props} />;
    }

    const iconSize = size === "sm" ? 16 : 18;

    return (
      <InputGroup size={size}>
        {hasLeftContent && (
          <InputLeftElement pointerEvents="none" color="fg.muted">
            {leftElement || (LeftIcon && <LeftIcon size={iconSize} />)}
          </InputLeftElement>
        )}
        <Input ref={ref} variant={variant} {...props} />
        {hasRightContent && (
          <InputRightElement color="fg.muted">
            {rightElement || (RightIcon && <RightIcon size={iconSize} />)}
          </InputRightElement>
        )}
      </InputGroup>
    );
  }
);

TextInput.displayName = "TextInput";
