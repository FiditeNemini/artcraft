import { TtsModelListItem } from "~/pages/PageEnigma/models/tts";
import { VoiceConversionModelListItem } from "./typesImported";

export type AudioPanelState = {
  firstLoad: boolean;
  page: AudioTabPages;
  lastWorkingAudioGeneration : AudioTabPages.TTS | AudioTabPages.V2V;
  ttsState: TtsState;
  v2vState: V2VState;
}
export type TtsState = {
  voice: TtsModelListItem | undefined;
  text: string;
  hasEnqueued: number;
  inferenceTokens: string[];
};

export type V2VState = {
  voice: VoiceConversionModelListItem | undefined;
  file: File | undefined;
  inputFileToken: string | undefined;
  hasEnqueued: number;
  inferenceTokens: string[];
};

export enum AudioTabPages {
  LIBRARY = 'library',
  GENERATE_AUDIO = 'generate_audio',
  TTS = 'tts',
  V2V = 'v2v',
  SELECT_TTS_MODEL = "select_tts_model",
  SELECT_V2V_MODEL = "select_v2v_model",
}
