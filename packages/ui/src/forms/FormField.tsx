"use client";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  type FormControlProps,
} from "@chakra-ui/react";

export interface FormFieldProps extends FormControlProps {
  /** Field label */
  label?: string;
  /** Helper text shown below the input */
  helperText?: string;
  /** Error message to display */
  error?: string;
  /** Hint text shown below the label */
  hint?: string;
  /** Whether the field is required */
  isRequired?: boolean;
  children: React.ReactNode;
}

/**
 * FormField provides a consistent wrapper for form inputs with label, error, and helper text.
 */
export function FormField({
  label,
  helperText,
  error,
  hint,
  isRequired,
  children,
  ...props
}: FormFieldProps) {
  return (
    <FormControl isInvalid={!!error} isRequired={isRequired} {...props}>
      {label && (
        <FormLabel
          fontSize="sm"
          fontWeight="medium"
          color="fg.default"
          mb={1}
        >
          {label}
          {hint && (
            <span
              style={{
                fontWeight: "normal",
                color: "var(--chakra-colors-fg-muted)",
                marginLeft: "0.5rem",
              }}
            >
              {hint}
            </span>
          )}
        </FormLabel>
      )}
      {children}
      {error && <FormErrorMessage fontSize="sm">{error}</FormErrorMessage>}
      {helperText && !error && (
        <FormHelperText fontSize="sm" color="fg.muted">
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}

FormField.displayName = "FormField";
