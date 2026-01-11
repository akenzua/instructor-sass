import type { ComponentStyleConfig } from "@chakra-ui/react";

export const badgeStyles: ComponentStyleConfig = {
  baseStyle: {
    px: 2,
    py: 0.5,
    textTransform: "none",
    fontSize: "xs",
    fontWeight: "medium",
    borderRadius: "md",
    lineHeight: "tall",
  },
  variants: {
    subtle: (props: { colorScheme?: string }) => {
      const colorScheme = props.colorScheme || "gray";
      return {
        bg: `${colorScheme}.100`,
        color: `${colorScheme}.800`,
        _dark: {
          bg: `${colorScheme}.900`,
          color: `${colorScheme}.200`,
        },
      };
    },
    solid: (props: { colorScheme?: string }) => {
      const colorScheme = props.colorScheme || "gray";
      const isWarning = colorScheme === "warning" || colorScheme === "yellow";
      return {
        bg: `${colorScheme}.500`,
        color: isWarning ? "gray.900" : "white",
        _dark: {
          bg: `${colorScheme}.400`,
          color: isWarning ? "gray.900" : "gray.900",
        },
      };
    },
    outline: (props: { colorScheme?: string }) => {
      const colorScheme = props.colorScheme || "gray";
      return {
        bg: "transparent",
        border: "1px solid",
        borderColor: `${colorScheme}.500`,
        color: `${colorScheme}.500`,
        _dark: {
          borderColor: `${colorScheme}.400`,
          color: `${colorScheme}.400`,
        },
      };
    },
  },
  defaultProps: {
    variant: "subtle",
    colorScheme: "gray",
  },
};
