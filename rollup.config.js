import postcss from 'rollup-plugin-postcss';
import styles from "rollup-plugin-styles";


export default {
  plugins: [
    postcss({
      modules: true,
      plugins: []
    }),
  ]
}