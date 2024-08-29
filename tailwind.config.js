/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Fira Sans", ...defaultTheme.fontFamily.sans],
      },
    },
    colors: {
      // color value shorthands
      transparent: "transparent",
      current: "currentColor",

      // common colors
      white: colors.white,
      black: colors.black,
      red: colors.red,
      oragne: colors.orange,
      yellow: colors.yellow,
      green: colors.green,
      blue: colors.sky, //use sky instead of blue
      indigo: colors.indigo,
      purple: colors.purple,

      // utility colors
      error: colors.red[500],
      warning: colors.yellow[500],
      success: colors.green[500],
      info: colors.sky[500],

      // brand colors
      primary: {
        //sunglo
        DEFAULT: "#e66462", //=500
        50: "#fdf3f3",
        100: "#fce4e4",
        200: "#facfce",
        300: "#f6acab",
        400: "#ef7c7a",
        500: "#e66462",
        600: "#cf3533",
        700: "#ae2927",
        800: "#902624",
        900: "#782524",
        950: "#410f0e",
      },
      secondary: {
        //gunpowder
        DEFAULT: "#39394c", //=950
        50: "#f5f6f9",
        100: "#e8eaf1",
        200: "#d7dbe6",
        300: "#bbc1d5",
        400: "#9aa2c0",
        500: "#8188b0",
        600: "#6f74a1",
        700: "#636492",
        800: "#545579",
        900: "#464762",
        950: "#39394c",
      },
      tertiary: {
        //Aquamarine Blue
        DEFAULT: "#1cb6be", //=300
        50: "#eefdfc",
        100: "#d4f9f8",
        200: "#aef3f3",
        300: "#62e4e6",
        400: "#38d3d8",
        500: "#1cb6be",
        600: "#1a94a0",
        700: "#1c7682",
        800: "#1f616b",
        900: "#1e505b",
        950: "#0e353e",
      },

      ui: {
        900: "#1a1a27",
        background: "#1a1a27",
        700: "#242433",
        panel: "#242433",
        500: "#393948",
        border: "#393948",
        300: "#515168",
        divider: "#515168",
        100: "#676781",
        button: "#676781",
      },
    },
  },
  plugins: [],
};
