import { TtsState } from './types';

export const initialTtsState: TtsState = {
  voice: undefined,
  text: "",
  hasEnqueued: 0,
  inferenceTokens: [],
  // inferenceJobType: undefined,
  hasTtsResult: false,
};