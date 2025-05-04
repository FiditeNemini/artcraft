import { SoundRegistry, SoundEffect } from "@storyteller/soundboard";
import { listen } from '@tauri-apps/api/event';

type SoraImageGenerationFailed = {
  prompt: string,
};

export const InstallImageGenerationFailure = () => {
  listen<SoraImageGenerationFailed>('sora-image-generation-failed', (event) => {
    const registry = SoundRegistry.getInstance();
    registry.playSound("fail");
  });
}

export const ImageGenerationFailure = () => {
}

