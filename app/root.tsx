import { useEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { Transition } from "@headlessui/react";
import { LinksFunction } from "@remix-run/deno";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/router";

import normalizeCss from "./styles/normalize.css?url";
import tailwindCss from "./styles/tailwind.css?url";
import baseCss from "./styles/base.css?url";

// The following import prevents a Font Awesome icon server-side rendering bug,
// where the icons flash from a very large icon down to a properly sized one:
import "@fortawesome/fontawesome-svg-core/styles.css";
// Prevent fontawesome from adding its CSS since we did it manually above:
import { config } from "@fortawesome/fontawesome-svg-core";

import {
  environmentVariables,
  pageHeight,
  pageWidth,
  persistLogin,
} from "~/signals";

import { LoadingDotsBricks, Toaster } from "~/components";

config.autoAddCss = false; /* eslint-disable import/first */

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

export async function loader() {
  return json({
    ENV: {
      // @ts-expect-error ProvessEnv is correct
      BASE_API: process.env.BASE_API || "%BUILD_BASE_API%",
      // @ts-expect-error ProvessEnv is correct
      GOOGLE_API: process.env.GOOGLE_API || "%BUILD_GOOGLE_API%",
      // @ts-expect-error ProvessEnv is correct
      FUNNEL_API: process.env.FUNNEL_API || "%BUILD_FUNNEL_API%",
      // @ts-expect-error ProvessEnv is correct
      CDN_API: process.env.CDN_API || "%BUILD_CDN_API%",
      EXPRESSIONS:
        // @ts-expect-error ProvessEnv is correct
        process.env.EXPRESSIONS === "true" || "%EXPRESSIONS_VALUE%" === "true",
    } as Record<string, string | boolean>,
  });
}

export default function App() {
  useSignals();
  const data = useLoaderData() as { ENV: Record<string, string> };

  const [showLoader, setShowLoader] = useState<boolean>(true);
  useEffect(() => {
    setTimeout(() => setShowLoader(false), 2500);
  }, []);

  useEffect(() => {
    persistLogin();

    function setPage() {
      // TODO address this issue with zooming
      pageHeight.value = window.innerHeight;
      pageWidth.value = window.innerWidth;
    }

    setPage();

    window.addEventListener("resize", setPage);

    return () => {
      window.removeEventListener("resize", setPage);
    };
  }, []);

  useEffect(() => {
    environmentVariables.value = data.ENV;
  }, [data]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="overflow-hidden bg-ui-background">
        <CompleteTakeoverLoadingScreen isShowing={showLoader} />
        <Toaster />
        <div className="topbar-spacer" />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function CompleteTakeoverLoadingScreen({ isShowing }: { isShowing: boolean }) {
  return (
    <Transition
      id="complete-takeover-loading-screen"
      show={isShowing}
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-1000"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      style={{
        backgroundColor: "#1a1a27",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <LoadingDotsBricks />
    </Transition>
  );
}
