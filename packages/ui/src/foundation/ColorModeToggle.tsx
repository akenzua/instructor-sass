"use client";

import {
  IconButton,
  useColorMode,
  type IconButtonProps,
} from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";

export interface ColorModeToggleProps
  extends Omit<IconButtonProps, "aria-label"> {
  "aria-label"?: string;
}

/**
 * ColorModeToggle provides a button to switch between light and dark modes.
 */
export function ColorModeToggle({
  "aria-label": ariaLabel = "Toggle color mode",
  ...props
}: ColorModeToggleProps) {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label={ariaLabel}
      icon={colorMode === "light" ? <Moon size={20} /> : <Sun size={20} />}
      onClick={toggleColorMode}
      variant="ghost"
      size="md"
      {...props}
    />
  );
}

ColorModeToggle.displayName = "ColorModeToggle";
