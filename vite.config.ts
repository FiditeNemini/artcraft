import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5741,
  },

  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: [["module:@preact/signals-react-transform"]],
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/onnxruntime-web/dist/*.wasm",
          dest: "wasm/",
        },
      ],
    }),
    {
      name: "wasm-mime-type",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.endsWith(".onnx")) {
            res.setHeader("Content-Type", "application/wasm");
          }
          next();
        });
      },
    },
  ],

  assetsInclude: ["**/.onnx", "**/*.wasm"],
});
