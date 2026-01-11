"use client";

import {
  Link as ChakraLink,
  type LinkProps as ChakraLinkProps,
} from "@chakra-ui/react";

export interface AppLinkProps extends ChakraLinkProps {
  /** Next.js Link component or any other link wrapper */
  as?: React.ElementType;
  /** URL to navigate to */
  href: string;
  /** Whether the link should open in a new tab */
  isExternal?: boolean;
  children: React.ReactNode;
}

/**
 * AppLink is a link component compatible with Next.js and other routing libraries.
 * Pass your router's Link component via the `as` prop.
 * 
 * @example
 * // With Next.js
 * import NextLink from 'next/link';
 * <AppLink as={NextLink} href="/dashboard">Dashboard</AppLink>
 * 
 * @example
 * // External link
 * <AppLink href="https://example.com" isExternal>Example</AppLink>
 */
export function AppLink({
  as: Component,
  href,
  isExternal,
  children,
  ...props
}: AppLinkProps) {
  const externalProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  if (Component) {
    return (
      <ChakraLink as={Component} href={href} {...externalProps} {...props}>
        {children}
      </ChakraLink>
    );
  }

  return (
    <ChakraLink href={href} {...externalProps} {...props}>
      {children}
    </ChakraLink>
  );
}

AppLink.displayName = "AppLink";
