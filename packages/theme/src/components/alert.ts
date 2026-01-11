import type { ComponentMultiStyleConfig, StyleFunctionProps } from "@chakra-ui/react";

export const alertStyles: ComponentMultiStyleConfig = {
  parts: ["container", "title", "description", "icon"],
  baseStyle: {
    container: {
      px: 4,
      py: 3,
      borderRadius: "md",
    },
    title: {
      fontWeight: "semibold",
      lineHeight: "tight",
    },
    description: {
      lineHeight: "normal",
    },
    icon: {
      flexShrink: 0,
      marginEnd: 3,
      w: 5,
      h: 5,
    },
  },
  variants: {
    subtle: (props: StyleFunctionProps) => {
      const status = props.status || "info";
      const statusMap: Record<string, Record<string, string>> = {
        info: { bg: "brand.subtle", color: "brand.700" },
        success: { bg: "success.subtle", color: "success.700" },
        warning: { bg: "warning.subtle", color: "warning.800" },
        error: { bg: "danger.subtle", color: "danger.700" },
      };
      const s = statusMap[status] || statusMap.info;
      return {
        container: {
          bg: s.bg,
          _dark: {
            bg: s.bg.replace(".subtle", ".900"),
          },
        },
        icon: { color: s.color },
        title: { color: s.color },
        description: { color: s.color },
      };
    },
    "left-accent": (props: StyleFunctionProps) => {
      const status = props.status || "info";
      const statusMap: Record<string, Record<string, string>> = {
        info: { borderColor: "brand.500", bg: "brand.subtle", color: "brand.700" },
        success: { borderColor: "success.500", bg: "success.subtle", color: "success.700" },
        warning: { borderColor: "warning.500", bg: "warning.subtle", color: "warning.800" },
        error: { borderColor: "danger.500", bg: "danger.subtle", color: "danger.700" },
      };
      const s = statusMap[status] || statusMap.info;
      return {
        container: {
          borderLeft: "4px solid",
          borderColor: s.borderColor,
          bg: s.bg,
          borderRadius: 0,
          ps: 3,
        },
        icon: { color: s.color },
        title: { color: s.color },
        description: { color: s.color },
      };
    },
    solid: (props: StyleFunctionProps) => {
      const status = props.status || "info";
      const statusMap: Record<string, Record<string, string>> = {
        info: { bg: "brand.500", color: "white" },
        success: { bg: "success.500", color: "white" },
        warning: { bg: "warning.500", color: "gray.900" },
        error: { bg: "danger.500", color: "white" },
      };
      const s = statusMap[status] || statusMap.info;
      return {
        container: { bg: s.bg },
        icon: { color: s.color },
        title: { color: s.color },
        description: { color: s.color },
      };
    },
  },
  defaultProps: {
    variant: "subtle",
    status: "info",
  },
};
