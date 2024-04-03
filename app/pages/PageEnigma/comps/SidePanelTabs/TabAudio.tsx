import { useContext, useEffect, useState } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { APPUI_ACTION_TYPES } from "../../reducers";
import { AppUiContext } from "../../contexts/AppUiContext";
import { useSignals } from "@preact/signals-react/runtime";
import { timelineHeight } from "~/pages/PageEnigma/store";

import { AnimationElement } from "./AnimationElement";
import { Button, Label, P } from "~/components";

export const TabAudio = () => {
  const { audioClips } = useContext(TrackContext);
  const [appUiState, dispatchAppUiState] = useContext(AppUiContext);

  useSignals();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setHeight(window.outerHeight - timelineHeight.value);
  }, []);

  const openTTSPanel = () =>{
    dispatchAppUiState({
      type: APPUI_ACTION_TYPES.OPEN_DIALOGUE_TTS
    })
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col">
        <Label>Generate</Label>
        <Button
          onClick={openTTSPanel}
          variant="secondary"
        >
          Create TTS Audio
        </Button>
        <span className="w-full h-3" />
        <Button
          disabled
          variant="secondary"
        >
          Create Voice to Voice Audio
        </Button>
      </div>
      <div className="flex flex-col mt-1">
        <Label>Preset Dialogues</Label>
      
        <div className="flex flex-wrap gap-2">
          {audioClips.map((clip) => {
            return (
              <AnimationElement key={clip.media_id} clip={clip} type="audio" />
            );
        })}
        </div>
      </div>

      <div className="flex flex-col mt-1">
        <Label>My Dialogues</Label>
        <div className="flex justify-center items-center text-center w-full h-40">
          <P className="text-brand-secondary-300"> No audio generated yet</P>
        </div>
      </div>

      <Button className="w-fit m-auto px-6 py-2"> Add to Lip Sync Track</Button>
    </div>
  );
};
