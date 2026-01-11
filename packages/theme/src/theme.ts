import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { tokens } from "./tokens";
import { semanticTokens } from "./semantic-tokens";
import {
  buttonStyles,
  inputStyles,
  selectStyles,
  textareaStyles,
  tabsStyles,
  badgeStyles,
  cardStyles,
  checkboxStyles,
  radioStyles,
  switchStyles,
  alertStyles,
  modalStyles,
  tableStyles,
} from "./components";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const fonts = {
  heading:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  mono:
    '"JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace',
};

const styles = {
  global: {
    body: {
      bg: "bg.canvas",
      color: "fg.default",
    },
    "*::placeholder": {
      color: "fg.placeholder",
    },
    "*, *::before, *::after": {
      borderColor: "border.default",
    },
  },
};

export const theme = {
  config,
  fonts,
  colors: tokens.colors,
  space: tokens.spacing,
  radii: tokens.radii,
  fontSizes: tokens.fontSizes,
  fontWeights: tokens.fontWeights,
  lineHeights: tokens.lineHeights,
  shadows: tokens.shadows,
  zIndices: tokens.zIndices,
  breakpoints: tokens.breakpoints,
  semanticTokens,
  styles,
  components: {
    Button: buttonStyles,
    Input: inputStyles,
    Select: selectStyles,
    Textarea: textareaStyles,
    Tabs: tabsStyles,
    Badge: badgeStyles,
    Card: cardStyles,
    Checkbox: checkboxStyles,
    Radio: radioStyles,
    Switch: switchStyles,
    Alert: alertStyles,
    Modal: modalStyles,
    Table: tableStyles,
  },
};

export const extendedTheme = extendTheme(theme);

export type AppTheme = typeof theme;
