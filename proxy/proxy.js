const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(
  "/v1",
  createProxyMiddleware({
    target: "https://api.fakeyou.com/v1",
    changeOrigin: true,
    secure: true,
    logger: console,
  }),
);

app.use(
  "/tts",
  createProxyMiddleware({
    target: "https://api.fakeyou.com/tts",
    changeOrigin: true,
    secure: true,
    logger: console,
  }),
);

app.use(
  "/google",
  createProxyMiddleware({
    target: "https://storage.googleapis.com",
    changeOrigin: true,
    secure: true,
    logger: console,
  }),
);

app.use(
  "/funnel",
  createProxyMiddleware({
    target: "https://funnel.tailce84f.ts.net",
    changeOrigin: true,
    secure: true,
    logger: console,
  }),
);

app.use(
  "/cdn",
  createProxyMiddleware({
    target: "https://cdn.storyteller.ai",
    changeOrigin: true,
    secure: true,
    logger: console,
  }),
);

app.listen(3000);
