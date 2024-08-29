import { StrictMode, useRef } from "react";
import { createRoot } from "react-dom/client";

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

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
