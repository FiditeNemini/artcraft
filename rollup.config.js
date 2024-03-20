// import postcss from 'rollup-plugin-postcss';
import styles from "rollup-plugin-styles";


export default {
  plugins: [
    // postcss({
    //   modules: true,
    //   plugins: []
    // }),
    styles({
      modules: true,
      // // ...or with custom options
      // modules: {},
      // ...additionally using autoModules
      autoModules: true,
      // // ...with custom regex
      // autoModules: /\.mod\.\S+$/,
      // // ...or custom function
      // autoModules: id => id.includes(".modular."),
    })
  ]
}