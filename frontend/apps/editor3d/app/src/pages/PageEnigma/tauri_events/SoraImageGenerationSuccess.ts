import { SoundRegistry, SoundEffect } from "@storyteller/soundboard";
import { listen } from '@tauri-apps/api/event';

type ImageGenerationSuccess = {
  media_file_token: string,
};

export const InstallImageGenerationSuccess = () => {
  listen<ImageGenerationSuccess>('sora-image-generation-complete', (event) => {
    const registry = SoundRegistry.getInstance();
    registry.playSound("success");
  });
}

export const ImageGenerationSuccess = () => {
}
