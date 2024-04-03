import { useContext, useState } from "react";
import { faVolume, faShuffle } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppUiContext } from "../../contexts/AppUiContext";
import { APPUI_ACTION_TYPES } from "../../reducers";
import { 
  Button,
  H5,
  Label,
  TransitionDialogue,
  Textarea
} from "~/components";

export const DialogueTTS = ()=>{
  const [appUiState, dispatchAppUiState] = useContext(AppUiContext);
  const handleClose = ()=> {
    dispatchAppUiState({
      type: APPUI_ACTION_TYPES.CLOSE_DIALOGUE_TTS
    })
  };

  return(
    <TransitionDialogue
      title={
        <>
          <FontAwesomeIcon icon={faVolume} className="pr-2"/>
          Generate TTS
        </>
      }
      className="max-w-xl"
      isOpen={appUiState.diagloueTts.isOpen}
      onClose={handleClose}
    >
      <>
        <Label>Select a Voice</Label>
        <div className="flex w-full justify-between">
          <Label>What would you like to say?</Label>
          <div className="flex gap-2 items-center">
            <FontAwesomeIcon className="text-brand-primary" icon={faShuffle}/>
            <H5 className="text-brand-primary">Randomized Text</H5>
          </div>
        </div>
        <Textarea
        />

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            onClick={handleClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={(e) => {
              console.log("Add to Lip Sync Track Triggered")
            }}
          >
            Add to Lip Sync Track
          </Button>
        </div>
      </>
    </TransitionDialogue>
  );
};