import { LinksFunction } from "@remix-run/deno";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import tailwindCss from "./tailwind.css?url";
import resetCss from "./tailwind.css?url";

export const links : LinksFunction = () => [{ 
  rel: "stylesheet",
  href: resetCss,
},{ 
  rel: "stylesheet",
  href: tailwindCss,
}];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={{margin:0}}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
