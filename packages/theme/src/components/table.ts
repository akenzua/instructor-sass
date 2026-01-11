import type { ComponentStyleConfig } from "@chakra-ui/react";

export const tableStyles: ComponentStyleConfig = {
  baseStyle: {
    table: {
      fontVariantNumeric: "lining-nums tabular-nums",
      borderCollapse: "separate",
      borderSpacing: 0,
      width: "full",
    },
    th: {
      fontFamily: "heading",
      fontWeight: "semibold",
      textTransform: "none",
      letterSpacing: "normal",
      textAlign: "start",
      color: "fg.muted",
      bg: "bg.subtle",
    },
    td: {
      textAlign: "start",
      color: "fg.default",
    },
    caption: {
      mt: 4,
      fontFamily: "heading",
      textAlign: "center",
      fontWeight: "medium",
      color: "fg.muted",
    },
  },
  sizes: {
    sm: {
      th: { px: 3, py: 2, fontSize: "xs", lineHeight: "1rem" },
      td: { px: 3, py: 2, fontSize: "sm", lineHeight: "1.25rem" },
    },
    md: {
      th: { px: 4, py: 3, fontSize: "sm", lineHeight: "1.25rem" },
      td: { px: 4, py: 3, fontSize: "md", lineHeight: "1.5rem" },
    },
    lg: {
      th: { px: 6, py: 4, fontSize: "md", lineHeight: "1.5rem" },
      td: { px: 6, py: 4, fontSize: "lg", lineHeight: "1.75rem" },
    },
  },
  variants: {
    simple: {
      th: {
        borderBottom: "1px solid",
        borderColor: "border.default",
      },
      td: {
        borderBottom: "1px solid",
        borderColor: "border.default",
      },
      tbody: {
        tr: {
          _hover: {
            bg: "bg.subtle",
          },
        },
      },
    },
    striped: {
      th: {
        borderBottom: "1px solid",
        borderColor: "border.default",
      },
      tbody: {
        tr: {
          _odd: {
            bg: "bg.subtle",
          },
          _hover: {
            bg: "bg.muted",
          },
        },
      },
    },
    unstyled: {},
  },
  defaultProps: {
    variant: "simple",
    size: "md",
  },
};
