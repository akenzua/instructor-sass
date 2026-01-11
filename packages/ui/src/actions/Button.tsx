"use client";

import { forwardRef } from "react";
import {
  Button as ChakraButton,
  type ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

export type ButtonVariant = "solid" | "outline" | "ghost";
export type ButtonTone = "primary" | "neutral" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<ChakraButtonProps, "variant" | "size" | "colorScheme" | "leftIcon" | "rightIcon"> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Color tone */
  tone?: ButtonTone;
  /** Size of the button */
  size?: ButtonSize;
  /** Icon to display on the left */
  leftIcon?: LucideIcon;
  /** Icon to display on the right */
  rightIcon?: LucideIcon;
}

const toneColorSchemes: Record<ButtonTone, string> = {
  primary: "teal",
  neutral: "gray",
  danger: "red",
};

/**
 * Button is a styled button component with consistent variants and tones.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "solid",
      tone = "primary",
      size = "md",
      leftIcon: LeftIconComponent,
      rightIcon: RightIconComponent,
      children,
      ...props
    },
    ref
  ) => {
    const iconSize = size === "sm" ? 16 : size === "lg" ? 20 : 18;

    return (
      <ChakraButton
        ref={ref}
        variant={variant}
        size={size}
        colorScheme={toneColorSchemes[tone]}
        leftIcon={
          LeftIconComponent ? <LeftIconComponent size={iconSize} /> : undefined
        }
        rightIcon={
          RightIconComponent ? (
            <RightIconComponent size={iconSize} />
          ) : undefined
        }
        {...props}
      >
        {children}
      </ChakraButton>
    );
  }
);

Button.displayName = "Button";
