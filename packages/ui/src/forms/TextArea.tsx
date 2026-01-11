"use client";

import { forwardRef } from "react";
import {
  Textarea as ChakraTextarea,
  type TextareaProps as ChakraTextareaProps,
} from "@chakra-ui/react";

export interface TextAreaProps extends ChakraTextareaProps {
  /** Visual style variant */
  variant?: "outline" | "filled";
  /** Size of the textarea */
  size?: "sm" | "md";
  /** Number of visible text lines */
  rows?: number;
  /** Whether the textarea can be resized */
  resize?: "none" | "vertical" | "horizontal" | "both";
}

/**
 * TextArea is a styled multiline text input component.
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      variant = "outline",
      size = "md",
      rows = 4,
      resize = "vertical",
      ...props
    },
    ref
  ) => {
    return (
      <ChakraTextarea
        ref={ref}
        variant={variant}
        size={size}
        rows={rows}
        resize={resize}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";
