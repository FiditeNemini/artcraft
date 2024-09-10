import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { RouterProvider } from "react-router-dom";
import { router } from "./router";

import { layout } from "~/signals/";

import "./global.css";
import { useRenderCounter } from "~/hooks/useRenderCounter";
const App = () => {
  const useStrictMode = false;
  useRenderCounter("App");

  useEffect(() => {
    const { windowWidth, windowHeight } = layout.signals;

    const handleResize = () => {
      windowWidth.value = window.innerWidth;
      windowHeight.value = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (useStrictMode) {
    return (
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    );
  }
  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")!).render(<App />);
