import { useState } from 'react';
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

import { TopBar } from "./templates/TopBar";
import { TopBarInnerContext } from '~/contexts/TopBarInner';


export const links : LinksFunction = () => [{ 
  rel: "stylesheet",
  href: normalizeCss,
},{ 
  rel: "stylesheet",
  href: tailwindCss,
}];

export default function App() {
  const [topBarInnerComponent, setTopBarInnerComponent] = useState<JSX.Element | null>(null);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-ui-background">
        <TopBarInnerContext.Provider value={{
            TopBarInner: topBarInnerComponent,
            setTopBarInner: setTopBarInnerComponent
          }}>
          
          <div className="h-10 m-4 w-screen border-b"/>
          <Outlet />
          <TopBar />
        </TopBarInnerContext.Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
