import type { ComponentMultiStyleConfig } from "@chakra-ui/react";

export const cardStyles: ComponentMultiStyleConfig = {
  parts: ["container", "header", "body", "footer"],
  baseStyle: {
    container: {
      bg: "bg.surface",
      borderRadius: "lg",
      overflow: "hidden",
    },
    header: {
      px: 6,
      py: 4,
      borderBottom: "1px solid",
      borderColor: "border.default",
    },
    body: {
      px: 6,
      py: 4,
    },
    footer: {
      px: 6,
      py: 4,
      borderTop: "1px solid",
      borderColor: "border.default",
    },
  },
  variants: {
    elevated: {
      container: {
        boxShadow: "md",
        border: "none",
        _dark: {
          boxShadow: "lg",
        },
      },
    },
    outlined: {
      container: {
        border: "1px solid",
        borderColor: "border.default",
        boxShadow: "none",
      },
    },
    filled: {
      container: {
        bg: "bg.subtle",
        border: "none",
        boxShadow: "none",
      },
    },
  },
  defaultProps: {
    variant: "elevated",
  },
};
