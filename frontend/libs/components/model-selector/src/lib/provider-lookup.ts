import { ModelPage } from "./model-pages";
import { Provider } from "@storyteller/tauri-api";

export type ProvidersByModel = Partial<Record<string, Provider[]>>;

// Centralized lookup: page (product/tab) → modelId → allowed providers
export const PROVIDER_LOOKUP_BY_PAGE: Record<ModelPage, ProvidersByModel> = {
  [ModelPage.TextToImage]: {
    midjourney: [Provider.ArtCraft],
    flux_pro_1_1: [Provider.ArtCraft, Provider.Fal],
    gpt_image_1: [Provider.Sora],
  },
  [ModelPage.ImageToVideo]: {},
  [ModelPage.Canvas2D]: {
    gpt_image_1: [Provider.Sora],
    flux_pro_1_1: [Provider.ArtCraft, Provider.Fal],
    midjourney: [Provider.ArtCraft],
  },
  [ModelPage.Stage3D]: {},
  [ModelPage.ImageEditor]: {
    gpt_image_1: [Provider.Sora],
    flux_pro_1_1: [Provider.ArtCraft, Provider.Fal],
  },
};
