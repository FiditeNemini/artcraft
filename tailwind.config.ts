import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
  content: [
    "./index.html",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    // extend: {},
    colors:{
      transparent: 'transparent',
      current: 'currentColor',

      'brand-primary': '#e66462',
      'brand-secondary': '#39394c',
      
      'ui-background': '#1a1a27',
      'ui-panel': '#242433',

      gray: colors.gray,
      white: colors.white
    }
  },
  plugins: [],
} satisfies Config