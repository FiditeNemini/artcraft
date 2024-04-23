import { useCallback, useContext, useEffect, useState } from "react";
import { useSignals, useSignalEffect } from "@preact/signals-react/runtime";

import { AuthenticationContext } from "~/contexts/Authentication";
import { MediaItem, AssetType } from "~/pages/PageEnigma/models";
import { TtsModelListItem } from "~/pages/PageEnigma/models/tts";
import { audioItemsFromServer } from "~/pages/PageEnigma/store/mediaFromServer";
import { ListAudioByUser, ListTtsModels } from "./utilities";
import { inferenceJobs } from "~/pages/PageEnigma/store/inferenceJobs";
import { JobState } from "~/hooks/useInferenceJobManager/useInferenceJobManager";

import { PageLibrary } from "./pageLibrary";
import { PageTTS } from "./pageTTS";
import { AudioTabPages } from "./types";

export const AudioTab = () => {
  // app wide data
  useSignals();
  const { authState } = useContext(AuthenticationContext);

  // local states and data
  const [ state, setState ] = useState({
    firstLoad: false,
    fetchingUserAudio: false,
    fetchingVoiceModels: false,
    page: AudioTabPages.LIBRARY,
  });

  const [voiceModels, setVoiceModels] = useState<Array<TtsModelListItem>>([]);


  const handleListAudioByUser = useCallback((username:string, sessionToken:string)=>{
    setState((curr)=>({...curr, fetchingUserAudio:true}));
    ListAudioByUser(username, sessionToken).then((res:any[])=>{
      setState((curr)=>({...curr, fetchingUserAudio:false}));
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

  const fetchVoiceModels = useCallback(async (sessionToken:string) => {
    ListTtsModels(sessionToken).then(res=>{
      if(res) setVoiceModels(res);
    });
  }, []);

  useEffect(()=>{
    if (authState.userInfo && authState.sessionToken){
      if(state.firstLoad === false){
        if( audioItemsFromServer.value.length === 0){
          handleListAudioByUser(authState.userInfo.username, authState.sessionToken);
        }
        if( voiceModels.length === 0){
          fetchVoiceModels(authState.sessionToken);
        }
        setState((curr)=>({...curr, firstLoad:true}));
        // completed the first load
      }
    }
  }, [authState, state, handleListAudioByUser, voiceModels, fetchVoiceModels]);

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
  }
  if(state.page === AudioTabPages.LIBRARY){
    return <PageLibrary changePage={changePage}/>
  }else if(state.page === AudioTabPages.TTS && authState.sessionToken){
    return(
      <PageTTS
        changePage={changePage}
        sessionToken={authState.sessionToken}
        voiceModels={voiceModels}
      />
    );
  }else{
    return(
      <p>Unknown Error</p>
    )
  }
};
