import type { ComponentStyleConfig } from "@chakra-ui/react";

export const tabsStyles: ComponentStyleConfig = {
  baseStyle: {
    tab: {
      fontWeight: "medium",
      transition: "all 0.2s",
      _focusVisible: {
        outline: "2px solid",
        outlineColor: "accent.default",
        outlineOffset: "-2px",
      },
      _disabled: {
        opacity: 0.5,
        cursor: "not-allowed",
      },
    },
    tablist: {
      borderColor: "border.default",
    },
    tabpanel: {
      p: 4,
    },
  },
  sizes: {
    sm: {
      tab: {
        fontSize: "sm",
        py: 1,
        px: 3,
      },
    },
    md: {
      tab: {
        fontSize: "md",
        py: 2,
        px: 4,
      },
    },
    lg: {
      tab: {
        fontSize: "lg",
        py: 3,
        px: 5,
      },
    },
  },
  variants: {
    line: {
      tablist: {
        borderBottom: "2px solid",
        borderColor: "border.default",
      },
      tab: {
        borderBottom: "2px solid",
        borderColor: "transparent",
        mb: "-2px",
        color: "fg.muted",
        _selected: {
          color: "accent.default",
          borderColor: "accent.default",
        },
        _hover: {
          color: "fg.default",
        },
      },
    },
    enclosed: {
      tablist: {
        borderBottom: "1px solid",
        borderColor: "border.default",
      },
      tab: {
        border: "1px solid",
        borderColor: "transparent",
        borderTopRadius: "md",
        mb: "-1px",
        color: "fg.muted",
        _selected: {
          color: "fg.default",
          bg: "bg.surface",
          borderColor: "border.default",
          borderBottomColor: "bg.surface",
        },
      },
    },
    "soft-rounded": {
      tab: {
        borderRadius: "full",
        color: "fg.muted",
        _selected: {
          color: "accent.fg",
          bg: "accent.default",
        },
        _hover: {
          color: "fg.default",
        },
      },
    },
  },
  defaultProps: {
    size: "md",
    variant: "line",
  },
};
