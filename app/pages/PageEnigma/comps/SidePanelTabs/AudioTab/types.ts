import { TtsModelListItem } from "~/pages/PageEnigma/models/tts";
import { VoiceConversionModelListItem } from "./typesImported";

export type TtsState = {
  voice: TtsModelListItem | undefined;
  text: string;
  hasEnqueued: number;
  inferenceTokens: string[];
};

export type V2VState = {
  voice: VoiceConversionModelListItem | undefined;
  hasEnqueued: number;
  inferenceTokens: string[];
};

export enum AudioTabPages {
  LIBRARY = 'library',
  TTS = 'tts',
  SELECT_TTS_MODEL = "select_tts_model",
  V2V = 'v2v',
  SELECT_V2V_MODEL = "select_v2v_model",
}
