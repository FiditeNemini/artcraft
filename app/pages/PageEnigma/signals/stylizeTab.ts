import { signal } from "@preact/signals-core";

export const promptsStore = {
  textBufferPositive: signal(""),
  textBufferNegative: signal(""),
  isUserInputPositive: signal(false),
  isUserInputNegative: signal(false),
  showNegativePrompt: signal(false),
};

export const adapterImage = signal<string | null>(null);

export const upscale = signal(false);
export const faceDetail = signal(false);
export const styleStrength = signal(1.0);
export const lipSync = signal(false);
export const cinematic = signal(false);
