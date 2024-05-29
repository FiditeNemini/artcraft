import { TtsModelListItem } from "~/pages/PageEnigma/models";
import { VoiceConversionModelListItem } from "~/pages/PageEnigma/models/types";
import { AudioTabPages } from "~/pages/PageEnigma/enums";

export type AudioPanelState = {
  firstLoad: boolean;
  page: AudioTabPages;
  lastWorkingAudioGeneration: AudioTabPages.TTS | AudioTabPages.V2V;
  ttsState: TtsState;
  v2vState: V2VState;
};
export type TtsState = {
  voice: TtsModelListItem | undefined;
  text: string;
};

export type V2VState = {
  voice: VoiceConversionModelListItem | undefined;
  file: File | undefined;
  inputFileToken: string | undefined;
};
