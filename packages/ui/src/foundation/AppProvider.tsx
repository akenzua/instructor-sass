"use client";

import {
  ChakraProvider,
  ColorModeScript,
  type ChakraProviderProps,
} from "@chakra-ui/react";
import { extendedTheme } from "@acme/theme";

export interface AppProviderProps extends Omit<ChakraProviderProps, "theme"> {
  children: React.ReactNode;
}

/**
 * AppProvider wraps the application with the Chakra UI provider and custom theme.
 * This should be placed at the root of your application.
 */
export function AppProvider({ children, ...props }: AppProviderProps) {
  return (
    <>
      <ColorModeScript initialColorMode="light" />
      <ChakraProvider theme={extendedTheme} {...props}>
        {children}
      </ChakraProvider>
    </>
  );
}

AppProvider.displayName = "AppProvider";
