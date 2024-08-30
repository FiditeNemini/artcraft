import { StrictMode, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { RouterProvider } from "react-router-dom";
import { router } from "./router";

import { layout } from "~/signals/";

import "./global.css";

const App = () => {
  const AppRerenderCount = useRef(0);
  AppRerenderCount.current++;
  if (AppRerenderCount.current === 1) {
    console.log(`App rerendered ${AppRerenderCount.current} times`);
  } else {
    console.warn(`App rerendered ${AppRerenderCount.current} times`);
  }

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
  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
