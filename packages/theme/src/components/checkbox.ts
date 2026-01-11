import type { ComponentStyleConfig } from "@chakra-ui/react";

export const checkboxStyles: ComponentStyleConfig = {
  baseStyle: {
    control: {
      borderRadius: "sm",
      borderWidth: "1px",
      borderColor: "border.default",
      transition: "all 0.2s",
      _checked: {
        bg: "accent.default",
        borderColor: "accent.default",
        color: "white",
        _hover: {
          bg: "accent.600",
          borderColor: "accent.600",
        },
      },
      _hover: {
        borderColor: "border.emphasized",
      },
      _focusVisible: {
        boxShadow: "0 0 0 2px var(--chakra-colors-accent-200)",
      },
      _disabled: {
        bg: "bg.subtle",
        borderColor: "border.default",
        cursor: "not-allowed",
        opacity: 0.6,
      },
      _invalid: {
        borderColor: "border.error",
      },
    },
    label: {
      color: "fg.default",
      _disabled: {
        color: "fg.disabled",
        cursor: "not-allowed",
      },
    },
  },
  sizes: {
    sm: {
      control: { h: 3, w: 3 },
      label: { fontSize: "sm" },
      icon: { fontSize: "0.45rem" },
    },
    md: {
      control: { h: 4, w: 4 },
      label: { fontSize: "md" },
      icon: { fontSize: "0.625rem" },
    },
    lg: {
      control: { h: 5, w: 5 },
      label: { fontSize: "lg" },
      icon: { fontSize: "0.75rem" },
    },
  },
  defaultProps: {
    size: "md",
  },
};
