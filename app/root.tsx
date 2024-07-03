import { useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { LinksFunction } from "@remix-run/deno";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import normalizeCss from "./styles/normalize.css?url";
import tailwindCss from "./styles/tailwind.css?url";
import baseCss from "./styles/base.css?url";

// The following import prevents a Font Awesome icon server-side rendering bug,
// where the icons flash from a very large icon down to a properly sized one:
import "@fortawesome/fontawesome-svg-core/styles.css";
// Prevent fontawesome from adding its CSS since we did it manually above:
import { config } from "@fortawesome/fontawesome-svg-core";

import EnvironmentVariables from "~/Classes/EnvironmentVariables";
import { pageHeight, pageWidth } from "~/signals";
import { Toaster } from "~/components";

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
  const env = {
    // @ts-expect-error ProvessEnv is correct
    BASE_API: process.env.BASE_API || "%BUILD_BASE_API%",
    // @ts-expect-error ProvessEnv is correct
    GOOGLE_API: process.env.GOOGLE_API || "%BUILD_GOOGLE_API%",
    // @ts-expect-error ProvessEnv is correct
    FUNNEL_API: process.env.FUNNEL_API || "%BUILD_FUNNEL_API%",
    // @ts-expect-error ProvessEnv is correct
    CDN_API: process.env.CDN_API || "%BUILD_CDN_API%",
    // @ts-expect-error ProvessEnv is correct
    GRAVATAR_API: process.env.GRAVATAR_API || "%BUILD_GRAVATAR_API%",
    // @ts-expect-error ProvessEnv is correct
    DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL || "%DEPLOY_PRIME_URL%",
    REACT_APP_PUBLIC_POSTHOG_KEY:
      // @ts-expect-error ProvessEnv is correct
      process.env.REACT_APP_PUBLIC_POSTHOG_KEY ||
      "%REACT_APP_PUBLIC_POSTHOG_KEY%",
    REACT_APP_PUBLIC_POSTHOG_UI:
      // @ts-expect-error ProvessEnv is correct
      process.env.REACT_APP_PUBLIC_POSTHOG_UI ||
      "%REACT_APP_PUBLIC_POSTHOG_UI%",
    // @ts-expect-error ProvessEnv is correct
    CONTEXT: process.env.CONTEXT || "%CONTEXT%",
  } as Record<string, string | boolean>;
  return { ENV: env };
}

export default function App() {
  const data = useLoaderData() as { ENV: Record<string, string> };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="overflow-hidden bg-ui-background">
        {data && <GlobalSettingsManager env={data.ENV} />}
        <div className="topbar-spacer" />
        <Toaster />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const GlobalSettingsManager = ({ env }: { env: Record<string, string> }) => {
  useSignals();
  useEffect(() => {
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
    EnvironmentVariables.initialize(env);
  }, [env]);

  return null;
};
