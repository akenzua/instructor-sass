import type { ComponentStyleConfig } from "@chakra-ui/react";

export const textareaStyles: ComponentStyleConfig = {
  baseStyle: {
    width: "100%",
    minWidth: 0,
    outline: 0,
    position: "relative",
    appearance: "none",
    transition: "all 0.2s",
    _disabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  },
  sizes: {
    sm: {
      fontSize: "sm",
      px: 3,
      py: 2,
      borderRadius: "sm",
      minH: "20",
    },
    md: {
      fontSize: "md",
      px: 4,
      py: 3,
      borderRadius: "md",
      minH: "24",
    },
  },
  variants: {
    outline: {
      bg: "bg.surface",
      border: "1px solid",
      borderColor: "border.default",
      color: "fg.default",
      _hover: {
        borderColor: "border.emphasized",
      },
      _focusVisible: {
        borderColor: "border.focused",
        boxShadow: "0 0 0 1px var(--chakra-colors-accent-500)",
      },
      _invalid: {
        borderColor: "border.error",
        boxShadow: "0 0 0 1px var(--chakra-colors-danger-500)",
      },
      _placeholder: {
        color: "fg.placeholder",
      },
      _dark: {
        bg: "gray.800",
      },
    },
    filled: {
      bg: "bg.subtle",
      border: "1px solid",
      borderColor: "transparent",
      color: "fg.default",
      _hover: {
        bg: "bg.muted",
      },
      _focusVisible: {
        bg: "bg.surface",
        borderColor: "border.focused",
      },
      _invalid: {
        borderColor: "border.error",
      },
      _placeholder: {
        color: "fg.placeholder",
      },
    },
  },
  defaultProps: {
    size: "md",
    variant: "outline",
  },
};
