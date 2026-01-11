import type { ComponentStyleConfig } from "@chakra-ui/react";

export const selectStyles: ComponentStyleConfig = {
  baseStyle: {
    field: {
      width: "100%",
      outline: 0,
      position: "relative",
      appearance: "none",
      transition: "all 0.2s",
      _disabled: {
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },
    icon: {
      color: "fg.muted",
    },
  },
  sizes: {
    sm: {
      field: {
        fontSize: "sm",
        ps: 3,
        pe: 8,
        h: 8,
        borderRadius: "sm",
      },
      icon: {
        insetEnd: 2,
      },
    },
    md: {
      field: {
        fontSize: "md",
        ps: 4,
        pe: 8,
        h: 10,
        borderRadius: "md",
      },
      icon: {
        insetEnd: 2,
      },
    },
  },
  variants: {
    outline: {
      field: {
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
        },
        _dark: {
          bg: "gray.800",
        },
      },
    },
    filled: {
      field: {
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
      },
    },
  },
  defaultProps: {
    size: "md",
    variant: "outline",
  },
};
