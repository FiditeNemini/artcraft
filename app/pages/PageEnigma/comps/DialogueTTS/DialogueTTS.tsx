import { useContext, useState } from "react";

import { AppUiContext } from "../../contexts/AppUiContext";
import { APPUI_ACTION_TYPES } from "../../reducers";
import { TransitionDialogue } from "~/components/TransitionDialogue";

export const DialogueTTS = ()=>{
  const [appUiState, dispatchAppUiState] = useContext(AppUiContext);
  const handleClose = ()=> {
    dispatchAppUiState({
      type: APPUI_ACTION_TYPES.CLOSE_DIALOGUE_TTS
    })
  };

  return(
    <TransitionDialogue
      title={"Generate TTS"}
      isOpen={appUiState.diagloueTts.isOpen}
      onClose={handleClose}
    >
      <p>TTS PANEL BODY</p>
    </TransitionDialogue>
  );
};