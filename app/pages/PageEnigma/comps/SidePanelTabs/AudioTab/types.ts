import { TtsModelListItem } from "~/pages/PageEnigma/models/tts";

export type TtsState = {
  voice: TtsModelListItem | undefined;
  text: string;
  hasEnqueued: number;
  inferenceTokens: string[];
  // inferenceJobType?: string;
  hasTtsResult: boolean;
};

export enum AudioTabPages {
  LIBRARY = 'library',
  TTS = 'tts',
  SELECT_TTS_MODEL = "select_tts_mode",
  V2V = 'v2v',
}
