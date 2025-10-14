import { extendTheme } from "@chakra-ui/react";

// 2. Call `extendTheme` and pass your custom values
const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  fonts: {
    body: "Figtree, sans-serif",
    heading: "Figtree, sans-serif",
    mono: "Roboto, monospace",
    text: "Figtree, sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: "#f8f8f8",
      },
    },
  },
  colors: {
    tiber: {
      DEFAULT: "#07332F",
      50: "#1DD4C4",
      100: "#1BC3B3",
      200: "#169F92",
      300: "#117B71",
      400: "#0C5750",
      500: "#07332F",
      main: "#07332F",
      text: "#F7A582",
    },
    primary: {
      50: "#e6f4ff",
      100: "#d2eaff",
      200: "#aed6ff",
      300: "#7db8ff",
      400: "#4a89ff",
      500: "#215bff",
      600: "#002eff",
      700: "#0032ff",
      800: "#002ad8",
      900: "#0828a7",
      950: "#041150",
      main: "#041150",
      text: "#34C38F",
      bg: "#485EC4",
      select: "#086BD8",
    },
    blue: {
      50: "#f1f4fd",
      100: "#e0e6f9",
      200: "#c9d4f4",
      300: "#a4b8ec",
      400: "#7893e2",
      500: "#4c66d6",
      600: "#4455cc",
      700: "#3a43bb",
      800: "#353998",
      900: "#2f3479",
      950: "#21224a",
      default: "#485EC4",
    },
    green: {
      main: "#00E2B8",
      text: "#34C38F",
    },
  },
});

export default theme;
