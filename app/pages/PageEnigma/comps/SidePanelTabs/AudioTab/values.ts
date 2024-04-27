import { TtsState, V2VState } from './types';

export const initialTtsState: TtsState = {
  voice: undefined,
  text: "",
  hasEnqueued: 0,
  inferenceTokens: [],
};

export const initialV2VState: V2VState = {
  voice: undefined,
  file: undefined,
  inputFileToken: undefined,
  hasEnqueued: 0,
  inferenceTokens: [],
};