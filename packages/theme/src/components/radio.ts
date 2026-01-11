import type { ComponentStyleConfig } from "@chakra-ui/react";

export const radioStyles: ComponentStyleConfig = {
  baseStyle: {
    control: {
      borderRadius: "full",
      borderWidth: "1px",
      borderColor: "border.default",
      transition: "all 0.2s",
      _checked: {
        bg: "white",
        borderColor: "accent.default",
        color: "accent.default",
        _before: {
          content: '""',
          display: "inline-block",
          pos: "relative",
          w: "50%",
          h: "50%",
          borderRadius: "full",
          bg: "currentColor",
        },
        _hover: {
          borderColor: "accent.600",
          color: "accent.600",
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
    },
    md: {
      control: { h: 4, w: 4 },
      label: { fontSize: "md" },
    },
    lg: {
      control: { h: 5, w: 5 },
      label: { fontSize: "lg" },
    },
  },
  defaultProps: {
    size: "md",
  },
};
