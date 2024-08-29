import { StrictMode, useRef } from "react";
import { createRoot } from "react-dom/client";

import environmentVariables from "~/Classes/EnvironmentVariables";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

import "./global.css";

const App = () => {
  const AppRerenderCount = useRef(0);
  AppRerenderCount.current++;
  if (AppRerenderCount.current === 1) {
    console.log(`App rerendered ${AppRerenderCount.current} times`);
  } else {
    console.warn(`App rerendered ${AppRerenderCount.current} times`);
  }

  if (Object.keys(environmentVariables.values).length === 0) {
    environmentVariables.initialize({
      BASE_API: import.meta.env.VITE_BASE_API,
      GOOGLE_API: import.meta.env.VITE_GOOGLE_API,
      FUNNEL_API: import.meta.env.VITE_FUNNEL_API,
      CDN_API: import.meta.env.VITE_CDN_API,
      GRAVATAR_API: import.meta.env.VITE_GRAVATAR_API,
    });
  }

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
