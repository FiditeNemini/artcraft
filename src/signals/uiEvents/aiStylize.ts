import { signal, effect } from "@preact/signals-react";

import { ArtStyleNames } from "~/components/features/DialogAiStylize/enums";

const stagedAiStylizeRequest = signal<{
  artstyle: ArtStyleNames;
  positivePrompt: string;
  negativePrompt: string;
} | null>(null);

export const requestAiStylize = (data: {
  artstyle: ArtStyleNames;
  positivePrompt: string;
  negativePrompt: string;
}) => {
  stagedAiStylizeRequest.value = data;
};

export const onRequestAiStylize = (
  callback: (data: {
    artstyle: ArtStyleNames;
    positivePrompt: string;
    negativePrompt: string;
  }) => void,
) => {
  effect(() => {
    if (stagedAiStylizeRequest.value) {
      callback(stagedAiStylizeRequest.value);
    }
  });
};
