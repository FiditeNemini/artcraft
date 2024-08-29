import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import EnvironmentVariables from "~/Classes/EnvironmentVariables";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

import "./global.css";

const App = () => {
  useEffect(() => {
    EnvironmentVariables.initialize(import.meta.env);
  }, []);

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
