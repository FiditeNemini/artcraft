import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import posthog from "posthog-js";
import EnvironmentVariables from "~/Classes/EnvironmentVariables";

function PosthogInit() {
  useEffect(() => {
    const data = EnvironmentVariables.values;

    const apiKey = data.REACT_APP_PUBLIC_POSTHOG_KEY as string;

    posthog.init(apiKey, {
      ui_host: data.DEPLOY_PRIME_URL as string,
      api_host: data.REACT_APP_PUBLIC_POSTHOG_UI as string,
    });
  }, []);

  return null;
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
      <PosthogInit />
    </StrictMode>,
  );
});
