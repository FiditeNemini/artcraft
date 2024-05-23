import { signal } from "@preact/signals-core";

export const promptsStore = {
  textBufferPositive: signal(""),
  textBufferNegative: signal(""),
  isUserInputPositive: signal(false),
  isUserInputNegative: signal(false),
};

export const showAdvancedOptions = signal(false);

export const upscale = signal(false);
export const faceDetail = signal(false);
export const styleStrength = signal(1.0);
