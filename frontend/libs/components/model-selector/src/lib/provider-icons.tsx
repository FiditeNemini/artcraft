import { getCreatorIcon, ModelCreator } from "@storyteller/model-list";
import { IsDesktopApp } from "@storyteller/tauri-utils";
import { Provider } from "@storyteller/tauri-api";
import { ReactNode } from "react";

const PROVIDER_TO_CREATOR: Partial<Record<Provider, ModelCreator>> = {
  [Provider.ArtCraft]: ModelCreator.ArtCraft,
  [Provider.Fal]: ModelCreator.Fal,
  [Provider.Sora]: ModelCreator.OpenAi,
  [Provider.Grok]: ModelCreator.Grok,
  [Provider.Midjourney]: ModelCreator.Midjourney,
};

export const getProviderIcon = (
  provider: Provider,
  className = "h-4 w-4 icon-auto-contrast"
): ReactNode => {
  const creator = PROVIDER_TO_CREATOR[provider];
  if (creator) return getCreatorIcon(creator, className);
  return (
    <img
      src={
        IsDesktopApp()
          ? "/resources/images/services/generic.svg"
          : "/images/services/generic.svg"
      }
      alt="generic logo"
      className={className}
    />
  );
};

export const getProviderDisplayName = (provider: Provider | string): string => {
  switch (provider) {
    case Provider.ArtCraft:
      return "ArtCraft";
    case Provider.Fal:
      return "Fal";
    case Provider.Sora:
      return "Sora / ChatGPT";
    case Provider.Grok:
      return "Grok";
    case Provider.Midjourney:
      return "Midjourney";
    case "worldlabs":
      return "World Labs";
    default:
      return provider;
  }
};
