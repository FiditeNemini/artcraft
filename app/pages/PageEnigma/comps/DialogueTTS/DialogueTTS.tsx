import { useCallback, useContext, useEffect, useState } from "react";
import { useSignalEffect } from "@preact/signals-react/runtime";
import { v4 as uuidv4 } from "uuid";
import {
  faVolume,
  faShuffle,
  // faPlay,
  faBrainCircuit,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppUiContext } from "~/contexts/AppUiContext";
import { APPUI_ACTION_TYPES } from "~/reducers";
import { 
  Button,
  H2,
  H5,
  Label,
  LoadingDotsTyping,
  ListSearchDropdown,
  TransitionDialogue,
  Textarea
} from "~/components";
import { ListTtsModels } from "./utilities";
import { TtsModelListItem } from "./types";
import { GenerateTtsAudio } from "./generateTts";
import { addInferenceJob, inferenceJobs} from "../../store/inferenceJobs";
import { JobState } from "~/hooks/useInferenceJobManager/useInferenceJobManager";

type TtsState = {
  voice: TtsModelListItem | undefined;
  text: string;
  hasEnqueued :boolean;
  inferenceToken?: string;
  inferenceJobType?: string;
  hasAudio: boolean;
  audioFile?: any;
}

export const DialogueTTS = ()=>{

  const [appUiState, dispatchAppUiState] = useContext(AppUiContext);
  const [ttsState, setTtsState] = useState<TtsState>({
    voice:undefined,
    text:"",
    hasEnqueued:false,
    hasAudio:false,
  });

  useSignalEffect(()=>{
    console.log(inferenceJobs.value);
    if(ttsState.hasEnqueued && ttsState.inferenceToken){
      const found = inferenceJobs.value.find((job)=>job.job_id===ttsState.inferenceToken);
      console.log(`finding: ${ttsState.inferenceToken}`);
      console.log(found);
      if(found?.job_status === JobState.COMPLETE_SUCCESS){
        setTtsState((curr)=>({
          ...curr,
          hasAudio: true,
          audioFile: found.result
        }))
      }
    }
  });

  const [ttsModels, setTtsModels] = useState<Array<TtsModelListItem>>([]);

  const listModels = useCallback(async () => {
    const ttsModelsLoaded = ttsModels.length > 0;
    if (ttsModelsLoaded) {
      return; // Already queried.
    }
    const models = await ListTtsModels();
    if (models) {
      setTtsModels(models);
    }
  }, []);

  useEffect(() => {
    listModels();
  }, [listModels]);

  useEffect(()=> {
    if(ttsState.hasEnqueued && ttsState.inferenceToken && ttsState.inferenceJobType){
      console.log(`tts has Enqueued`);
      addInferenceJob({
        version:1,
        job_id: ttsState.inferenceToken,
        job_type: ttsState.inferenceJobType,
        job_status: JobState.PENDING,
      })
    }
  },[ttsState]);

  const requestTts = useCallback( ()=>{
    const modelToken = ttsState.voice ? ttsState.voice.model_token : undefined;

    if(modelToken){
      setTtsState((curr)=>({
        ...curr,
        hasEnqueued: true,
        inferenceToken: undefined,
        inferenceJobType: undefined,
        hasAudio: false,
        result: undefined,
      }));

      const request = {
        uuid_idempotency_token: uuidv4(),
        tts_model_token: modelToken,
        inference_text: ttsState.text,
      };

      GenerateTtsAudio(request).then(res=>{
        if(res.inference_job_token){
          setTtsState((curr)=>({
            ...curr,
            inferenceToken: res.inference_job_token,
            inferenceJobType: res.inference_job_token_type
          }));
        }
      });
    }else{
      console.log("no voice model selected");
    }
  },[ttsState]);

  const handleClose = ()=> {
    if(ttsState.hasAudio){
      setTtsState((curr)=>({
        ...curr,
        hasEnqueued: false,
        inferenceToken: undefined,
        inferenceJobType: undefined,
        hasAudio: false,
        result: undefined,
      }));
    }
    dispatchAppUiState({
      type: APPUI_ACTION_TYPES.CLOSE_DIALOGUE_TTS
    })
  };

  const handleTextInput = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  )=>{
    setTtsState((curr)=>({
      ...curr,
      text: e.target.value,
    }));
  };

  const handleOnSelect = (val:string)=>{
    const voiceModel = ttsModels.find((item)=>{
      if (item.title === val) return item
    })
    // console.log(val);
    // console.log(voiceModel);
    setTtsState((curr)=>({
      ...curr,
      voice: voiceModel,
    }));
  }

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
      <div className="flex flex-col">
        <Label className="mb-1">Select a Voice</Label>
        <ListSearchDropdown
          list={ttsModels}
          listDisplayKey="title"
          onSelect={handleOnSelect}
        />
        <div className="flex w-full justify-between mt-4">
          <Label>What would you like to say?</Label>
          <div className="flex gap-2 items-center">
            <FontAwesomeIcon className="text-brand-primary" icon={faShuffle}/>
            <H5 className="text-brand-primary">Randomized Text</H5>
          </div>
        </div>
        <Textarea
          placeholder="Enter what you want the voice to say here."
          value={ttsState.text}
          onChange={handleTextInput}
        />
        <div className="mt-6 flex gap-2">
          <div className="w-full h-12">
            {!ttsState.hasAudio && !ttsState.hasEnqueued &&
              <Button
                className="w-36 h-full text-xl "
                variant={ttsState.hasAudio ? "secondary" : "primary" }
                disabled={ttsState.text === ""}
                icon={faBrainCircuit}
                onClick={requestTts}
              >
                Generate
              </Button>
            }
            {!ttsState.hasAudio && ttsState.hasEnqueued &&
              <LoadingDotsTyping className="bg-brand-secondary-500 rounded-lg"/>
            }
            { ttsState.hasAudio &&
              <div className="bg-success w-full h-full rounded-lg flex items-center justify-center">
                <H2>Success!! Please Check "My Audio" in the Audio Panel.</H2>
              </div>
            }
          </div>
          
        </div>

        <div className="mt-6 flex justify-between gap-2">
          { ttsState.hasEnqueued &&
            <Button
              type="button"
              disabled={!ttsState.hasAudio}
              onClick={requestTts}
              icon={faBrainCircuit}
            >
              Generate Another
            </Button>
          }
          <span />
          <Button
            type="button"
            onClick={handleClose}
            variant="secondary"
          >
            {ttsState.hasEnqueued ? 'Close':'Cancel'}
          </Button>
        </div>
      </div>
    </TransitionDialogue>
  );
};