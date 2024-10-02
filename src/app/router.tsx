import { createBrowserRouter } from "react-router-dom";
import { Login } from "~/app/pages/login";
import { Main } from "~/app/pages/main";
// import { Sandbox } from "~/app/pages/sandbox";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  // {
  //   path: "/sandbox",
  //   element: <Sandbox />,
  // },
]);
