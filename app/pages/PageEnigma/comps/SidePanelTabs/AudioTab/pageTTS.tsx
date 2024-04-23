import { useCallback, } from "react";
import { v4 as uuidv4 } from "uuid";

import { faVolumeHigh, faChevronRight} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  Button,
  Label,
  Textarea,
} from "~/components";

import { GenerateTtsAudioResponse, } from "~/pages/PageEnigma/models/tts";


import { GenerateTtsAudio, } from "./utilities";
import { AudioTabPages, TtsState } from "./types";

export const PageTTS = ({
  changePage,
  sessionToken,
  ttsState,
  setTtsState,
}:{
  changePage: (newPage:AudioTabPages) => void;
  sessionToken: string;
  ttsState: TtsState,
  setTtsState: (newState:TtsState)=>void,
})=>{

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
                  res.inference_job_token
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
      <Label className="mb-1">Select a Voice</Label>
      <div
        className="p-3 bg-brand-secondary rounded-lg flex justify-between items-center gap-3 cursor-pointer"
        onClick={()=>changePage(AudioTabPages.SELECT_TTS_MODEL)}
      >
        <span className="bg-brand-secondary-600 rounded-lg w-12 h-12"/>
        <div className="grow">
          {!ttsState.voice && <h4>None Selected</h4>}
        </div>
        <FontAwesomeIcon icon={faChevronRight} size="2x"/>
      </div>

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
        className="h-11 w-full text-sm mt-4"
        variant="primary"
        disabled={ttsState.text === ""}
        icon={faVolumeHigh}
        onClick={() => requestTts(sessionToken)}>
        Generate
      </Button>
    </>
  );
};
