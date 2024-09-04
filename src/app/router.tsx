import { createBrowserRouter } from "react-router-dom";
import { Login } from "~/pages/login";
import { Main } from "~/pages/main";
import { Sandbox } from "~/pages/sandbox";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sandbox",
    element: <Sandbox />,
  },
]);
