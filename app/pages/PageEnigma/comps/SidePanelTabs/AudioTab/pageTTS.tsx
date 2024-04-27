import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

import { faVolumeHigh, faChevronRight } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { H4, H6, Button, Label, Textarea } from "~/components";

import { GenerateTtsAudioResponse } from "~/pages/PageEnigma/models/tts";

import { GenerateTtsAudio } from "./utilities";
import { AudioTabPages, TtsState } from "./types";

export const PageTTS = ({
  changePage,
  sessionToken,
  ttsState,
  setTtsState,
}: {
  changePage: (newPage: AudioTabPages) => void;
  sessionToken: string;
  ttsState: TtsState;
  setTtsState: (newState: TtsState) => void;
}) => {
  const requestTts = useCallback(
    (sessionToken: string) => {
      const modelToken = ttsState.voice
        ? ttsState.voice.model_token
        : undefined;

      if (modelToken) {
        const request = {
          uuid_idempotency_token: uuidv4(),
          tts_model_token: modelToken,
          inference_text: ttsState.text,
        };

        GenerateTtsAudio(request, sessionToken).then(
          (res: GenerateTtsAudioResponse) => {
            if (res && res.inference_job_token) {
              setTtsState({
                ...ttsState,
                inferenceTokens: [
                  ...ttsState.inferenceTokens,
                  res.inference_job_token,
                ],
              });

              changePage(AudioTabPages.LIBRARY);
            }
          },
        );
      } else {
        console.log("no voice model selected");
      }
    },
    [ttsState],
  );

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTtsState({
      ...ttsState,
      text: e.target.value,
    });
  };

  return (
    <>
      <Label>Select a Voice</Label>
      <button
        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-brand-secondary p-3 text-start transition-all hover:bg-ui-controls-button/40"
        onClick={() => changePage(AudioTabPages.SELECT_TTS_MODEL)}>
        <span className="h-12 w-12 rounded-lg bg-ui-controls-button/100" />
        <div className="grow">
          {!ttsState.voice && <H4>None Selected</H4>}
          {ttsState.voice && (
            <>
              <H4>{ttsState.voice.title}</H4>
              <H6 className="text-white/70">
                by {ttsState.voice.creator_display_name}
              </H6>
            </>
          )}
        </div>
        <FontAwesomeIcon icon={faChevronRight} className="text-xl opacity-60" />
      </button>

      <div className="mt-4 w-full">
        <Textarea
          label="What would you like to say?"
          placeholder="Enter what you want the voice to say here."
          value={ttsState.text}
          onChange={handleTextInput}
          rows={8}
        />
      </div>

      <Button
        className="mt-4 h-11 w-full text-sm"
        variant="primary"
        disabled={ttsState.text === ""}
        icon={faVolumeHigh}
        onClick={() => requestTts(sessionToken)}>
        Generate
      </Button>
    </>
  );
};
