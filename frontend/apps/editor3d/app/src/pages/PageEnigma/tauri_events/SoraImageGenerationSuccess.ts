import { SoundRegistry, SoundEffect } from "@storyteller/soundboard";
import { listen } from '@tauri-apps/api/event';
import { AppPreferencesPayload, CustomDirectory, GetAppPreferences, SystemDirectory } from "@storyteller/tauri-api";

type ImageGenerationSuccess = {
  media_file_token: string,
};

export const InstallImageGenerationSuccess = () => {
  listen<ImageGenerationSuccess>('sora-image-generation-complete', async (event) => {
    console.log("sora-image-generation-complete event", event);
    const prefs = await GetAppPreferences();
    console.log("prefs", prefs);
    const soundName = prefs.preferences?.generation_success_sound;
    console.log("soundName", soundName);
    if (soundName !== undefined) {
      console.log("playing sound", soundName);
      const registry = SoundRegistry.getInstance();
      registry.playSound(soundName);
    }
  });
}

export const ImageGenerationSuccess = () => {
}
