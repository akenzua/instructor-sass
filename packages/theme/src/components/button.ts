import type { ComponentStyleConfig, StyleFunctionProps } from "@chakra-ui/react";

export const buttonStyles: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: "semibold",
    borderRadius: "md",
    lineHeight: "1.2",
    transition: "all 0.2s ease-in-out",
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "accent.default",
      outlineOffset: "2px",
    },
  },
  sizes: {
    sm: {
      h: "8",
      minW: "8",
      fontSize: "sm",
      px: "3",
    },
    md: {
      h: "10",
      minW: "10",
      fontSize: "md",
      px: "4",
    },
    lg: {
      h: "12",
      minW: "12",
      fontSize: "lg",
      px: "6",
    },
  },
  variants: {
    // Solid variants by tone
    solid: (props: StyleFunctionProps) => {
      const tone = props.tone || "primary";
      const toneMap: Record<string, Record<string, string>> = {
        primary: {
          bg: "accent.default",
          color: "white",
          _hover: "accent.600",
          _active: "accent.700",
        },
        neutral: {
          bg: "gray.600",
          color: "white",
          _hover: "gray.700",
          _active: "gray.800",
        },
        danger: {
          bg: "danger.default",
          color: "white",
          _hover: "danger.600",
          _active: "danger.700",
        },
      };
      const t = toneMap[tone] || toneMap.primary;
      return {
        bg: t.bg,
        color: t.color,
        _hover: {
          bg: t._hover,
          _disabled: { bg: t.bg },
        },
        _active: { bg: t._active },
        _disabled: {
          bg: "bg.muted",
          color: "fg.disabled",
          cursor: "not-allowed",
          opacity: 0.6,
        },
      };
    },
    outline: (props: StyleFunctionProps) => {
      const tone = props.tone || "primary";
      const toneMap: Record<string, Record<string, string>> = {
        primary: {
          borderColor: "accent.default",
          color: "accent.default",
          _hover: "accent.subtle",
        },
        neutral: {
          borderColor: "border.emphasized",
          color: "fg.default",
          _hover: "bg.subtle",
        },
        danger: {
          borderColor: "danger.default",
          color: "danger.default",
          _hover: "danger.subtle",
        },
      };
      const t = toneMap[tone] || toneMap.primary;
      return {
        bg: "transparent",
        borderWidth: "1px",
        borderColor: t.borderColor,
        color: t.color,
        _hover: {
          bg: t._hover,
          _disabled: { bg: "transparent" },
        },
        _disabled: {
          borderColor: "border.default",
          color: "fg.disabled",
          cursor: "not-allowed",
          opacity: 0.6,
        },
      };
    },
    ghost: (props: StyleFunctionProps) => {
      const tone = props.tone || "primary";
      const toneMap: Record<string, Record<string, string>> = {
        primary: {
          color: "accent.default",
          _hover: "accent.subtle",
        },
        neutral: {
          color: "fg.default",
          _hover: "bg.subtle",
        },
        danger: {
          color: "danger.default",
          _hover: "danger.subtle",
        },
      };
      const t = toneMap[tone] || toneMap.primary;
      return {
        bg: "transparent",
        color: t.color,
        _hover: {
          bg: t._hover,
          _disabled: { bg: "transparent" },
        },
        _disabled: {
          color: "fg.disabled",
          cursor: "not-allowed",
          opacity: 0.6,
        },
      };
    },
  },
  defaultProps: {
    size: "md",
    variant: "solid",
  },
};
