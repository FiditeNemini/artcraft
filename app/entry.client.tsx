import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import { posthog } from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import EnvironmentVariables from "~/Classes/EnvironmentVariables";

function PosthogInit() {
  useEffect(() => {
    const data = EnvironmentVariables.values;

    const apiKey = data.REACT_APP_PUBLIC_POSTHOG_KEY as string;
    posthog.init(apiKey, {
      api_host: data.DEPLOY_PRIME_URL + "/ingest" as string,
      ui_host: data.REACT_APP_PUBLIC_POSTHOG_UI as string,
    });
  }, []);

  return null;
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <PostHogProvider client={posthog}>
        <RemixBrowser />
      </PostHogProvider>
      <PosthogInit />
    </StrictMode>,
  );
});
