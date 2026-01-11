/**
 * Semantic tokens for Instructor SaaS design system
 * These map to meaningful design concepts and support light/dark modes
 */

export const semanticTokens = {
  colors: {
    // Background tokens
    "bg.canvas": {
      default: "gray.50",
      _dark: "gray.900",
    },
    "bg.surface": {
      default: "white",
      _dark: "gray.800",
    },
    "bg.subtle": {
      default: "gray.100",
      _dark: "gray.700",
    },
    "bg.muted": {
      default: "gray.200",
      _dark: "gray.600",
    },
    "bg.emphasized": {
      default: "gray.300",
      _dark: "gray.500",
    },
    "bg.inverse": {
      default: "gray.900",
      _dark: "gray.50",
    },

    // Foreground/text tokens
    "fg.default": {
      default: "gray.900",
      _dark: "gray.50",
    },
    "fg.muted": {
      default: "gray.600",
      _dark: "gray.400",
    },
    "fg.subtle": {
      default: "gray.500",
      _dark: "gray.500",
    },
    "fg.placeholder": {
      default: "gray.400",
      _dark: "gray.500",
    },
    "fg.inverse": {
      default: "white",
      _dark: "gray.900",
    },
    "fg.disabled": {
      default: "gray.400",
      _dark: "gray.600",
    },

    // Border tokens
    "border.default": {
      default: "gray.200",
      _dark: "gray.700",
    },
    "border.muted": {
      default: "gray.100",
      _dark: "gray.800",
    },
    "border.subtle": {
      default: "gray.100",
      _dark: "gray.700",
    },
    "border.emphasized": {
      default: "gray.300",
      _dark: "gray.600",
    },
    "border.focused": {
      default: "accent.500",
      _dark: "accent.400",
    },
    "border.error": {
      default: "danger.500",
      _dark: "danger.400",
    },

    // Accent/Primary tokens (teal - driving instructor theme)
    "accent.default": {
      default: "accent.500",
      _dark: "accent.400",
    },
    "accent.emphasis": {
      default: "accent.600",
      _dark: "accent.300",
    },
    "accent.muted": {
      default: "accent.100",
      _dark: "accent.900",
    },
    "accent.subtle": {
      default: "accent.50",
      _dark: "accent.900",
    },
    "accent.fg": {
      default: "white",
      _dark: "gray.900",
    },

    // Brand tokens (blue)
    "brand.default": {
      default: "brand.500",
      _dark: "brand.400",
    },
    "brand.emphasis": {
      default: "brand.600",
      _dark: "brand.300",
    },
    "brand.muted": {
      default: "brand.100",
      _dark: "brand.900",
    },
    "brand.subtle": {
      default: "brand.50",
      _dark: "brand.900",
    },

    // Success tokens
    "success.default": {
      default: "success.500",
      _dark: "success.400",
    },
    "success.emphasis": {
      default: "success.600",
      _dark: "success.300",
    },
    "success.muted": {
      default: "success.100",
      _dark: "success.900",
    },
    "success.subtle": {
      default: "success.50",
      _dark: "success.900",
    },
    "success.fg": {
      default: "white",
      _dark: "gray.900",
    },

    // Warning tokens
    "warning.default": {
      default: "warning.500",
      _dark: "warning.400",
    },
    "warning.emphasis": {
      default: "warning.600",
      _dark: "warning.300",
    },
    "warning.muted": {
      default: "warning.100",
      _dark: "warning.900",
    },
    "warning.subtle": {
      default: "warning.50",
      _dark: "warning.900",
    },
    "warning.fg": {
      default: "gray.900",
      _dark: "gray.900",
    },

    // Danger tokens
    "danger.default": {
      default: "danger.500",
      _dark: "danger.400",
    },
    "danger.emphasis": {
      default: "danger.600",
      _dark: "danger.300",
    },
    "danger.muted": {
      default: "danger.100",
      _dark: "danger.900",
    },
    "danger.subtle": {
      default: "danger.50",
      _dark: "danger.900",
    },
    "danger.fg": {
      default: "white",
      _dark: "gray.900",
    },
  },
  shadows: {
    "shadow.xs": {
      default: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      _dark: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
    },
    "shadow.sm": {
      default: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
      _dark: "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)",
    },
    "shadow.md": {
      default: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      _dark: "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)",
    },
    "shadow.lg": {
      default: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
      _dark: "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)",
    },
  },
} as const;

export type SemanticTokens = typeof semanticTokens;
