import { useCallback, useContext, useEffect, useState } from "react";
import { useSignals, useSignalEffect } from "@preact/signals-react/runtime";

import { AuthenticationContext } from "~/contexts/Authentication";
import {
  AudioMediaItem,
  AssetType,
  JobState,
  InferenceJobType,
} from "~/pages/PageEnigma/models";
import { audioItemsFromServer } from "~/pages/PageEnigma/store/mediaFromServer";
import {
  ListAudioByUser,
  ListTtsModels,
  ListVoiceConversionModels,
} from "./utilities";
import {
  addInferenceJob,
  inferenceJobs,
} from "~/pages/PageEnigma/store/inferenceJobs";

import { PageLibrary } from "./pageLibrary";
import { PageAudioGeneration } from "./pageAudioGeneration";
import { AudioTabPages, AudioPanelState } from "./types";
import { initialTtsState, initialV2VState } from "./values";
import { TtsModelListItem } from "~/pages/PageEnigma/models/tts";
import { VoiceConversionModelListItem, MediaFile } from "./typesImported";
import { PageSelectTtsModel } from "./pageSelectTtsModel";
import { PageSelectV2VModel } from "./pageSelectV2VModel";

export const AudioTab = () => {
  // app wide data
  useSignals();
  const { authState } = useContext(AuthenticationContext);

  // local states and data
  const [ state, setState ] = useState<AudioPanelState>({
    firstLoad: false,
    page: AudioTabPages.LIBRARY,
    // children states are managed at top level for persistent memories
    lastWorkingAudioGeneration: AudioTabPages.TTS,
    ttsState: initialTtsState,
    v2vState: initialV2VState,
  });

  const [ttsModels, setTtsModels] = useState<Array<TtsModelListItem>>([]);
  const [v2vModels, setV2VModels] = useState<
    Array<VoiceConversionModelListItem>
  >([]);

  const handleListAudioByUser = useCallback((username:string, sessionToken:string)=>{
    function getTitle (item:any){
      if (item.maybe_title) return item.maybe_title;
      if (item.origin && item.origin.maybe_model && item.origin.maybe_model.title) return item.origin.maybe_model.title;
      return "Media Audio";
    }
    function getCategory (item:any){
      if(item.origin && item.origin.product_category && item.origin.product_category !== "unknown" ) return item.origin.product_category;
      if(item.origin_category) return item.origin_category;
      return "unknown";
    }
    function checkIsNew(token:string){
      const findNewItem = inferenceJobs.value.find((job=>{
        if(job.result && job.result.entity_token){ 
          return token === job.result.entity_token;
        }else {
          return false;
        }
      }))
      return findNewItem !== undefined;
    }
    function getLength(item:any){
      return item.maybe_duration_millis 
        ? item.maybe_duration_millis / 1000 * 60
        : undefined;
    }
    ListAudioByUser(username, sessionToken).then((res:MediaFile[])=>{
      audioItemsFromServer.value = res.map(item=>{
        const morphedItem:AudioMediaItem = {
          version: 1,
          type: AssetType.AUDIO,
          category: getCategory(item),
          media_id: item.token,
          object_uuid: item.token,
          name: getTitle(item),
          description: item.maybe_text_transcript || "",
          publicBucketPath: item.public_bucket_path,
          length: getLength(item),
          thumbnail: "/resources/placeholders/audio_placeholder.png",
          isMine: true,
          isNew: checkIsNew(item.token),
          // isBookmarked?: boolean;
        }
        return morphedItem;
      });
    });
  },
    [],
  );

  useEffect(() => {
    if (
      authState.userInfo &&
      authState.sessionToken &&
      state.firstLoad === false
    ) {
      //fetch all the data on first load once, after securing auth info
      handleListAudioByUser(
        authState.userInfo.username,
        authState.sessionToken,
      );
      ListTtsModels(authState.sessionToken).then((res) => {
        if (res) setTtsModels(res);
      });
      ListVoiceConversionModels(authState.sessionToken).then((res) => {
        if (res) setV2VModels(res);
      });
      setState((curr) => ({ ...curr, firstLoad: true }));
      // completed the first load
    }
  }, [authState, state, handleListAudioByUser]);

  useEffect(() => {
    //this listens to ttsState and push its new inference jobs
    setState((curr)=>{
      const {ttsState: currTtsState} = curr;
      if(currTtsState.hasEnqueued < currTtsState.inferenceTokens.length ){
        addInferenceJob({
          version: 1,
          job_id: currTtsState.inferenceTokens[currTtsState.inferenceTokens.length - 1],
          job_type: InferenceJobType.TextToSpeech,
          job_status: JobState.PENDING,
        });
        return {
          ...curr,
          ttsState:{
            ...currTtsState,
            hasEnqueued: currTtsState.hasEnqueued + 1
          }
        };
      }
      return curr; //case of no new jobs, do nothing
    });
  }, [state.ttsState]);

  useEffect(()=> {
    //this listens to v2vState and push its new inference jobs
    setState((curr)=>{
      const {v2vState: currV2VState} = curr;
      if(currV2VState.hasEnqueued < currV2VState.inferenceTokens.length ){
        addInferenceJob({
          version: 1,
          job_id: currV2VState.inferenceTokens[currV2VState.inferenceTokens.length - 1],
          job_type: InferenceJobType.VoiceConversion,
          job_status: JobState.PENDING,
        });
        return {
          ...curr,
          v2vState:{
            ...currV2VState,
            hasEnqueued: currV2VState.hasEnqueued + 1
          }
        }
      }
      return curr; //case of no new jobs, do nothing
    });
  }, [state.v2vState]);

  useSignalEffect(() => {
    // when inference changes, check if there's a new audio to refresh for
    if (authState.userInfo && authState.sessionToken) {
      let hasNewCompletedJob = false;
      inferenceJobs.value.forEach((job) => {
        if (
          job.job_status === JobState.COMPLETE_SUCCESS &&
          (job.job_type === InferenceJobType.TextToSpeech ||
            job.job_type === InferenceJobType.VoiceConversion)
        ) {
          const foundItemOfJob = audioItemsFromServer.value.find((item) => {
            return item.media_id === job.result.entity_token;
          });
          hasNewCompletedJob = foundItemOfJob === undefined;
        }
      });
      if (hasNewCompletedJob) {
        handleListAudioByUser(
          authState.userInfo.username,
          authState.sessionToken,
        );
      }
    }
  });

  const changePage = (newPage: AudioTabPages) => {
    setState((curr) => ({
      ...curr,
      page: newPage,
    }));
  };

  switch (state.page) {
    case AudioTabPages.LIBRARY:
      return <PageLibrary changePage={changePage} />;
    case AudioTabPages.SELECT_TTS_MODEL: {
      return (
        <PageSelectTtsModel
          changePage={changePage}
          ttsModels={ttsModels}
          onSelect={(selectedVoice)=>{
            setState((curr)=>({
              ...curr,
              ttsState: {...curr.ttsState, voice: selectedVoice},
              page: AudioTabPages.GENERATE_AUDIO
            }));
          }}
        />
      );
    }
    case AudioTabPages.SELECT_V2V_MODEL: {
      return (
        <PageSelectV2VModel
          changePage={changePage}
          v2vModels={v2vModels}
          onSelect={(selectedVoice)=>{
            setState((curr)=>({
              ...curr,
              v2vState: {...curr.v2vState, voice: selectedVoice},
              page: AudioTabPages.GENERATE_AUDIO
            }));
          }}
        />
      );
    }
    case AudioTabPages.GENERATE_AUDIO:{
      if(authState.sessionToken){
        return(
          <PageAudioGeneration
            changePage={changePage}
            sessionToken={authState.sessionToken}
            audioPanelState={state}
            setAudioPanelState={setState}
          />
        );
      } else {
        return <p>Page not ready Error</p>;
      }
    }
    default:
      return <p>Unknown Page Error</p>;
  }
};
