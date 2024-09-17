import { signal, effect } from "@preact/signals-react";
import {
  RandomTextsNegative,
  RandomTextsPositive,
} from "~/components/features/DialogAiStylize/data/randomTextList";

import { ArtStyleNames } from "~/components/features/DialogAiStylize/enums";

interface AiStylizeSingalType {
  artstyle: ArtStyleNames;
  positivePrompt: string;
  negativePrompt: string;
  cinematic: boolean;
  enginePreProcessing: boolean;
  faceDetail: boolean;
  lipSync: boolean;
  upscale: boolean;
  styleStrength: number;
}
const initialValues = {
  artstyle: ArtStyleNames.Anime2DFlat,
  positivePrompt: RandomTextsPositive[ArtStyleNames.Anime2DFlat][0],
  negativePrompt: RandomTextsNegative[ArtStyleNames.Anime2DFlat][0],
  cinematic: false,
  enginePreProcessing: false,
  faceDetail: false,
  lipSync: false,
  upscale: false,
  styleStrength: 0.8,
};
const stagedAiStylizeRequest = signal<AiStylizeSingalType>(initialValues);

const dispatchRequest = (data: AiStylizeSingalType) => {
  stagedAiStylizeRequest.value = data;
};

const onRequest = (callback: (data: AiStylizeSingalType) => void) => {
  effect(() => {
    if (stagedAiStylizeRequest.value) {
      callback(stagedAiStylizeRequest.value);
    }
  });
};

const getCurrentValues = stagedAiStylizeRequest.value;
const getInitialValues = initialValues;

export const aiStylizeDispatchers = {
  dispatchRequest,
};
export const aiStylizeEvents = {
  onRequest,
  getCurrentValues,
  getInitialValues,
};
