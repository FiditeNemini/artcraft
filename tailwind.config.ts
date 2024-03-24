import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

export default {
  content: [
    "./index.html",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "custom-font": ["Fira Sans", "sans-serif"],
      },
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",

      "brand-primary": {
        //sunglo
        DEFAULT: "#e66462", //=500
        "50": "#fdf3f3",
        "100": "#fce4e4",
        "200": "#facfce",
        "300": "#f6acab",
        "400": "#ef7c7a",
        "500": "#e66462",
        "600": "#cf3533",
        "700": "#ae2927",
        "800": "#902624",
        "900": "#782524",
        "950": "#410f0e",
      },
      "brand-secondary": {
        //gunpowder
        DEFAULT: "#39394c", //=950
        "50": "#f5f6f9",
        "100": "#e8eaf1",
        "200": "#d7dbe6",
        "300": "#bbc1d5",
        "400": "#9aa2c0",
        "500": "#8188b0",
        "600": "#6f74a1",
        "700": "#636492",
        "800": "#545579",
        "900": "#464762",
        "950": "#39394c",
      },
      danger: {
        //copper rust
        DEFAULT: "#8f4951", //=700
        "50": "#fbf5f5",
        "100": "#f7ecec",
        "200": "#efdcdc",
        "300": "#e2c0bf",
        "400": "#d19b9c",
        "500": "#bd7679",
        "600": "#a5595f",
        "700": "#8f4951",
        "800": "#743d45",
        "900": "#64373f",
        "950": "#361b1e",
      },

      success: {
        //apple
        DEFAULT: "#40ad48", //=500
        "50": "#f2fbf2",
        "100": "#e2f6e3",
        "200": "#c5edc7",
        "300": "#98dd9d",
        "400": "#64c46b",
        "500": "#40ad48",
        "600": "#2f8a35",
        "700": "#286d2e",
        "800": "#245728",
        "900": "#1f4823",
        "950": "#0c270f",
      },

      "ui-background": "#1a1a27",
      "ui-panel": "#242433",
      "ui-panel-border": "#393948",
      "ui-controls": "#39394D",
      "ui-controls-button": "#676781",

      gray: colors.gray,
      white: colors.white,
    },
  },
  plugins: [],
} satisfies Config;
