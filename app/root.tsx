import React, { useState, useEffect } from "react";
import { CookiesProvider } from "react-cookie";
import { Transition } from "@headlessui/react";
import { LinksFunction } from "@remix-run/deno";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import normalizeCss from "./styles/normalize.css?url";
import tailwindCss from "./styles/tailwind.css?url";
import baseCss from "./styles/base.css?url";

import { LoadingDotsBricks } from "~/components";
import { TopBar } from "./modules/TopBar";
import { TopBarInnerContext } from "~/contexts/TopBarInner";
import { AuthenticationProvider, UserInfo } from "./contexts/Authentication";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: normalizeCss,
  },
  {
    rel: "stylesheet",
    href: tailwindCss,
  },
  {
    rel: "stylesheet",
    href: baseCss,
  },
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
  },
];

export default function App() {
  const [topBarInnerComponent, setTopBarInnerComponent] =
  useState<{
    location: string,
    node: React.ReactNode,
  } | null>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  useEffect(()=>{
    setTimeout(()=>setShowLoader(false), 2500);
  },[]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="overflow-hidden bg-ui-background">
        <CompleteTakeoverLoadingScreen isShowing={showLoader}/>
        <CookiesProvider defaultSetOptions={{ path: '/' }}>
          <AuthenticationProvider>
            <TopBarInnerContext.Provider
              value={{
                TopBarInner: topBarInnerComponent,
                setTopBarInner: setTopBarInnerComponent,
              }}
            >
              <div className="topbar-spacer" />
              <Outlet />
              <TopBar />
            </TopBarInnerContext.Provider>
          </AuthenticationProvider>
        </CookiesProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function CompleteTakeoverLoadingScreen({isShowing}:{isShowing:boolean}){
  return(
    <Transition
      id='complete-takeover-loading-screen'
      show={isShowing}
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-1000"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      style={{
        backgroundColor: '#1a1a27',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <LoadingDotsBricks />
    </Transition>
  );
};
