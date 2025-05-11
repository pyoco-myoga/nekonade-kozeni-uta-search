/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify, type ThemeDefinition } from "vuetify";

const kozeniColorTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: "#FFFFFF",
    primary: "#F790A6",
    secondary: "#A0D8EF",
    "on-primary": "#FFFFFF",
    "on-background": "#7D7D7D",
    surface: "#FFFFFF",
  },
};

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: "kozeniColorTheme",
    themes: {
      kozeniColorTheme,
    },
  },
});
