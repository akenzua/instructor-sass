import React from "react";
import type { Preview } from "@storybook/react";
import { ChakraProvider, ColorModeScript, Box } from "@chakra-ui/react";
import { extendedTheme } from "@acme/theme";

// Decorator that provides Chakra UI context
const ChakraDecorator = (Story: React.ComponentType) => {
  return (
    <ChakraProvider theme={extendedTheme}>
      <ColorModeScript initialColorMode="light" />
      <Box p={4}>
        <Story />
      </Box>
    </ChakraProvider>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#FAFAFA" },
        { name: "dark", value: "#141414" },
      ],
    },
    layout: "padded",
  },
  decorators: [ChakraDecorator],
  globalTypes: {
    colorMode: {
      name: "Color Mode",
      description: "Color mode for components",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
