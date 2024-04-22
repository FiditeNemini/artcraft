import { useCallback, useEffect, useState } from "react";
import { useSignalEffect } from "@preact/signals-react/runtime";
import { v4 as uuidv4 } from "uuid";

import {
  faChevronLeft,
  faBrainCircuit,
} from "@fortawesome/pro-solid-svg-icons";

import { 
  Button, ButtonIcon, H2, Label,
  LoadingDotsTyping,
  ListSearchDropdown,
  Textarea
} from "~/components";

import { TtsModelListItem, GenerateTtsAudioResponse } from "~/pages/PageEnigma/models/tts";

import { addInferenceJob, inferenceJobs} from "../../../store/inferenceJobs";
import { JobState } from "~/hooks/useInferenceJobManager/useInferenceJobManager";
import { ListTtsModels, GenerateTtsAudio } from "./utilities";
import { AudioTabPages } from "./types";

type TtsState = {
  voice: TtsModelListItem | undefined;
  text: string;
  hasEnqueued :boolean;
  inferenceToken?: string;
  inferenceJobType?: string;
  hasAudio: boolean;
  audioFile?: any;
}


export const PageTTS =({
  changePage 
}:{
  changePage: (newPage:AudioTabPages) => void
})=>{
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

      GenerateTtsAudio(request).then((res:GenerateTtsAudioResponse)=>{
        if(res && res.inference_job_token){
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

  const handleTextInput = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  )=>{
    setTtsState((curr)=>({
      ...curr,
      text: e.target.value,
    }));
  };

  const handleOnSelect = (val:string)=>{
    console.log( val);
    const voiceModel = ttsModels.find((item)=>{
      if (item.title === val) return item
    })
    setTtsState((curr)=>({
      ...curr,
      voice: voiceModel,
    }));
  }

  return(
    <div className="flex flex-col p-4">
      <div className="flex items-center">
        <ButtonIcon
          icon={faChevronLeft}
          onClick={()=>changePage(AudioTabPages.LIBRARY)}
        />
        <H2>Generate TTS</H2>
      </div>
      <Label className="mb-1">Select a Voice</Label>
      {ttsModels.length > 0 && <ListSearchDropdown
        list={ttsModels}
        listDisplayKey="title"
        onSelect={handleOnSelect}
      /> }
      <div className="flex w-full justify-between mt-4">
        <Label>What would you like to say?</Label>
        <div className="flex gap-2 items-center">
          {/* <FontAwesomeIcon className="text-brand-primary" icon={faShuffle}/>
          <H5 className="text-brand-primary">Randomized Text</H5> */}
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
            <div className="bg-inference-job-success w-full h-full rounded-lg flex items-center justify-center p-2">
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
      </div>
    </div>
  );
}