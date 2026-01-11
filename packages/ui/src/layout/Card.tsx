"use client";

import {
  Box,
  Heading,
  type BoxProps,
  useMultiStyleConfig,
} from "@chakra-ui/react";

export interface CardProps extends Omit<BoxProps, "variant"> {
  /** Visual style variant */
  variant?: "elevated" | "outlined" | "filled";
  children: React.ReactNode;
}

export interface CardHeaderProps extends BoxProps {
  children: React.ReactNode;
}

export interface CardBodyProps extends BoxProps {
  children: React.ReactNode;
}

export interface CardFooterProps extends BoxProps {
  children: React.ReactNode;
}

export interface CardTitleProps extends BoxProps {
  children: React.ReactNode;
}

/**
 * Card component provides a container for grouping related content.
 */
export function Card({ variant = "elevated", children, ...props }: CardProps) {
  const styles = useMultiStyleConfig("Card", { variant });

  return (
    <Box __css={styles.container} {...props}>
      {children}
    </Box>
  );
}

/**
 * CardHeader contains the header section of a card.
 */
export function CardHeader({ children, ...props }: CardHeaderProps) {
  const styles = useMultiStyleConfig("Card");

  return (
    <Box __css={styles.header} {...props}>
      {children}
    </Box>
  );
}

/**
 * CardBody contains the main content of a card.
 */
export function CardBody({ children, ...props }: CardBodyProps) {
  const styles = useMultiStyleConfig("Card");

  return (
    <Box __css={styles.body} {...props}>
      {children}
    </Box>
  );
}

/**
 * CardFooter contains the footer section of a card.
 */
export function CardFooter({ children, ...props }: CardFooterProps) {
  const styles = useMultiStyleConfig("Card");

  return (
    <Box __css={styles.footer} {...props}>
      {children}
    </Box>
  );
}

/**
 * CardTitle provides a styled heading for card headers.
 */
export function CardTitle({ children, ...props }: CardTitleProps) {
  return (
    <Heading size="md" color="fg.default" {...props}>
      {children}
    </Heading>
  );
}

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardBody.displayName = "CardBody";
CardFooter.displayName = "CardFooter";
CardTitle.displayName = "CardTitle";
