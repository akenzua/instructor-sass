import type { ComponentStyleConfig } from "@chakra-ui/react";

export const switchStyles: ComponentStyleConfig = {
  baseStyle: {
    track: {
      bg: "bg.muted",
      transition: "all 0.2s",
      _checked: {
        bg: "accent.default",
      },
      _disabled: {
        opacity: 0.6,
        cursor: "not-allowed",
      },
      _focusVisible: {
        boxShadow: "0 0 0 2px var(--chakra-colors-accent-200)",
      },
    },
    thumb: {
      bg: "white",
      transition: "transform 0.2s",
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
      track: { w: 6, h: 3 },
      thumb: {
        w: 3,
        h: 3,
        _checked: {
          transform: "translateX(0.75rem)",
        },
      },
    },
    md: {
      track: { w: 9, h: 5 },
      thumb: {
        w: 5,
        h: 5,
        _checked: {
          transform: "translateX(1rem)",
        },
      },
    },
    lg: {
      track: { w: 11, h: 6 },
      thumb: {
        w: 6,
        h: 6,
        _checked: {
          transform: "translateX(1.25rem)",
        },
      },
    },
  },
  defaultProps: {
    size: "md",
  },
};
