import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RouterProvider } from "react-router-dom";
import { router } from "./router";

import "./global.css";
import { useRenderCounter } from "~/hooks/useRenderCounter";
const App = () => {
  const useStrictMode = false;
  useRenderCounter("App");

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
