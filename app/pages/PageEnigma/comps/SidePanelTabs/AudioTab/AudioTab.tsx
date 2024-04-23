import { useCallback, useContext, useEffect, useState } from "react";
import { useSignals, useSignalEffect } from "@preact/signals-react/runtime";

import { AuthenticationContext } from "~/contexts/Authentication";
import { MediaItem, AssetType } from "~/pages/PageEnigma/models";
import { audioItemsFromServer } from "~/pages/PageEnigma/store/mediaFromServer";
import { ListAudioByUser, ListTtsModels, ListVoiceConversionModels } from "./utilities";
import { addInferenceJob, inferenceJobs } from "~/pages/PageEnigma/store/inferenceJobs";
import { JobState } from "~/hooks/useInferenceJobManager/useInferenceJobManager";
import { FrontendInferenceJobType } from "~/pages/PageEnigma/models";

import { PageLibrary } from "./pageLibrary";
import { PageAudioGeneration } from "./pageAudioGeneration";
import { AudioTabPages, TtsState } from "./types";
import { initialTtsState } from "./values";
import { TtsModelListItem, } from "~/pages/PageEnigma/models/tts";
import { VoiceConversionModelListItem } from "./typesImported";
import { PageSelectTtsModel } from "./pageSelectTtsModel";

export const AudioTab = () => {
  // app wide data
  useSignals();
  const { authState } = useContext(AuthenticationContext);

  // local states and data
  const [ state, setState ] = useState({
    firstLoad: false,
    page: AudioTabPages.LIBRARY,
  });

  // children states are managed at top level for persistent memories
  const [ttsState, setTtsState] = useState<TtsState>(initialTtsState);
  const handleSetTtsState = (newState: TtsState) => {
    setTtsState((curr:TtsState)=>({
      ...curr,
      ...newState,
    }));
  };
  const [ttsModels, setTtsModels] = useState<Array<TtsModelListItem>>([]);
  const [v2vModels, setV2VModels] = useState<Array<VoiceConversionModelListItem>>([]);


  const handleListAudioByUser = useCallback((username:string, sessionToken:string)=>{
    ListAudioByUser(username, sessionToken).then((res:any[])=>{
      audioItemsFromServer.value = res.map(item=>{
        const morphedItem:MediaItem = {
          version: 1,
          type: AssetType.AUDIO,
          media_id: item.token,
          object_uuid: item.token,
          name: item.maybe_title || item.origin.maybe_model.title,
          description: item.maybe_text_transcript,
          publicBucketPath: item.public_bucket_path,
          length: 25,
          thumbnail: "/resources/placeholders/audio_placeholder.png",
          isMine: true,
          // isBookmarked?: boolean;
        }
        return morphedItem;
      });
    });
  }, []);

  useEffect(()=>{
    if (
      authState.userInfo &&
      authState.sessionToken &&
      state.firstLoad === false
    ){
        //fetch all the data on first load once, after securing auth info
        handleListAudioByUser(authState.userInfo.username, authState.sessionToken);
        ListTtsModels(authState.sessionToken).then(res=>{
          if(res) setTtsModels(res);
        });
        ListVoiceConversionModels(authState.sessionToken).then(res=>{
          if(res) setV2VModels(res);
        });
        setState((curr)=>({...curr, firstLoad:true}));
        // completed the first load
    }
  }, [authState, state, handleListAudioByUser]);

  useEffect(()=> {
    //this listens to ttsState and push its new inference jobs
    setTtsState((curr)=>{
      if(curr.hasEnqueued < curr.inferenceTokens.length ){
        // console.log(`tts has Enqueued`);
        addInferenceJob({
          version: 1,
          job_id: ttsState.inferenceTokens[ttsState.inferenceTokens.length - 1],
          job_type: FrontendInferenceJobType.TextToSpeech,
          job_status: JobState.PENDING,
        });
        return({
          ...curr,
          hasEnqueued: curr.hasEnqueued + 1
        })
      }
      return curr; //case of no new jobs, do nothing
    });
  }, [ttsState]);

  useEffect(()=>{
    console.info('Audio Tab is mounting')
    return()=>{console.info('Audio Tab is dismounting')}
  }, []);

  useSignalEffect(()=>{
    // when inference changes, check if there's a new audio to refresh for
    if (inferenceJobs.value.length > 0 && authState.userInfo){
      const found = inferenceJobs.value.find((job)=>{
        if(job.job_status === JobState.COMPLETE_SUCCESS){
          console.log(job);

          const foundItemOfJob = audioItemsFromServer.value.find((item)=>{
            return item.media_id === job.result.entity_token
          });

          return foundItemOfJob !== undefined;
        }
      });
      if(found === undefined && authState.sessionToken){
        handleListAudioByUser(authState.userInfo.username, authState.sessionToken);
      }
    }
  });

  const changePage = (newPage:AudioTabPages)=>{
    setState((curr)=>({
      ...curr,
      page: newPage
    }))
  };

  switch(state.page){
    case AudioTabPages.LIBRARY:
      return <PageLibrary changePage={changePage}/>
    case AudioTabPages.SELECT_TTS_MODEL:{
      return (
        <PageSelectTtsModel
          changePage={changePage}
          ttsModels={ttsModels}
          setTtsState={handleSetTtsState}
        />
      );
    }
    case AudioTabPages.TTS:
    case AudioTabPages.V2V:{
      if(authState.sessionToken){
        return(
          <PageAudioGeneration
            page={state.page}
            changePage={changePage}
            sessionToken={authState.sessionToken}
            ttsState={ttsState}
            setTtsState={handleSetTtsState}
            v2vModels={v2vModels}
          />
        );
      }else{
        return <p>Page not ready Error</p>
      }
    }
    default:
      return <p>Unknown Page Error</p>
  }
};
