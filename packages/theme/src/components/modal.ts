import type { ComponentStyleConfig } from "@chakra-ui/react";

export const modalStyles: ComponentStyleConfig = {
  baseStyle: {
    overlay: {
      bg: "blackAlpha.600",
    },
    dialogContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    dialog: {
      borderRadius: "lg",
      bg: "bg.surface",
      boxShadow: "xl",
      mx: 4,
    },
    header: {
      px: 6,
      py: 4,
      fontSize: "lg",
      fontWeight: "semibold",
    },
    closeButton: {
      position: "absolute",
      top: 3,
      insetEnd: 3,
      borderRadius: "md",
      _focusVisible: {
        boxShadow: "0 0 0 2px var(--chakra-colors-accent-200)",
      },
    },
    body: {
      px: 6,
      py: 4,
    },
    footer: {
      px: 6,
      py: 4,
      display: "flex",
      justifyContent: "flex-end",
      gap: 3,
    },
  },
  sizes: {
    sm: {
      dialog: { maxW: "sm" },
    },
    md: {
      dialog: { maxW: "md" },
    },
    lg: {
      dialog: { maxW: "lg" },
    },
    xl: {
      dialog: { maxW: "xl" },
    },
    full: {
      dialog: { maxW: "100vw", minH: "100vh", my: 0, borderRadius: 0 },
    },
  },
  defaultProps: {
    size: "md",
  },
};
