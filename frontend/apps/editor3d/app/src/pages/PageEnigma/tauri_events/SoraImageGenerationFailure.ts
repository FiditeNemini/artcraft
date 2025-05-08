import { SoundRegistry, SoundEffect } from "@storyteller/soundboard";
import { listen } from '@tauri-apps/api/event';
import { AppPreferencesPayload, CustomDirectory, GetAppPreferences, SystemDirectory } from "@storyteller/tauri-api";
import { toast } from "@storyteller/ui-toaster";

type SoraImageGenerationFailed = {
  prompt: string,
};

export const InstallImageGenerationFailure = () => {
  listen<SoraImageGenerationFailed>('sora-image-generation-failed', async (event) => {
    console.log("sora-image-generation-failed event", event);
    const prefs = await GetAppPreferences();
    console.log("prefs", prefs);
    const soundName = prefs.preferences?.generation_failure_sound;
    console.log("soundName", soundName);
    if (soundName !== undefined) {
      console.log("playing sound", soundName);
      const registry = SoundRegistry.getInstance();
      registry.playSound(soundName);
    }
    toast.error("Image generation failed!");
  });
}

export const ImageGenerationFailure = () => {
}

