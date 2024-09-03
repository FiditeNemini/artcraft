/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";
import { storytellerColors } from "./tailwind.stcolors";

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
      gray: storytellerColors.gunpowder,
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
      primary: storytellerColors.sunglo,
      secondary: storytellerColors.gunpowder,
      tertiary: storytellerColors.aquamarineBlue,

      ui: {
        background: storytellerColors.gunpowder[100],
        panel: storytellerColors.gunpowder[100],
        border: storytellerColors.gunpowder[300],
        divider: storytellerColors.gunpowder[300],
        button: storytellerColors.gunpowder[500],
      },
    },
  },
  plugins: [],
};
