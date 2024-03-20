import { LinksFunction } from "@remix-run/deno";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import tailwindCss from "./styles/tailwind.css?url";
import normalizeCss from "./styles/normalize.css?url";

import { TopBar } from "./template/TopBar";

export const links : LinksFunction = () => [{ 
  rel: "stylesheet",
  href: normalizeCss,
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
      <body className="bg-ui-background">
        <Outlet />
        <TopBar />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
