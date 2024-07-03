import { useFeatureFlagEnabled } from "posthog-js/react";
import { FeatureFlags } from "~/enums/FeatureFlags";
import environmentVariables from "~/Classes/EnvironmentVariables";

export const usePosthogFeatureFlag = (flag: FeatureFlags): boolean => {
  const enabled = useFeatureFlagEnabled(flag) ?? false;
  if (environmentVariables.values.CONTEXT !== "PRODUCTION") {
    return true;
  }
  return enabled;
};
