import { useCallback, useContext, useEffect, useState } from "react";
import { useSignals, useSignalEffect } from "@preact/signals-react/runtime";

import { AuthenticationContext } from "~/contexts/Authentication";
import { MediaItem, AssetType } from "~/pages/PageEnigma/models";
import { audioItemsFromServer } from "~/pages/PageEnigma/store/mediaFromServer";
import { ListAudioByUser } from "./utilities";
import { inferenceJobs } from "~/pages/PageEnigma/store/inferenceJobs";
import { JobState } from "~/hooks/useInferenceJobManager/useInferenceJobManager";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";

import { PageLibrary } from "./pageLibrary";
import { PageTTS } from "./pageTTS";
import { AudioTabPages } from "./types";

export const AudioTabComponent = () => {
  useSignals();
  const [state, setState] = useState({
    firstLoad: false,
    fetchingUserAudio: false,
    page: AudioTabPages.LIBRARY,
  });
  const { authState } = useContext(AuthenticationContext);

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
        };
        return morphedItem;
      });
    });
  }, []);

  useEffect(()=>{
    if (authState.userInfo && authState.sessionToken){
      if(state.firstLoad === false && audioItemsFromServer.value.length === 0){
        handleListAudioByUser(authState.userInfo.username, authState.sessionToken);
        setState((curr)=>({...curr, firstLoad:true}));
      }
    }
  }, [authState, state, handleListAudioByUser]);

  useSignalEffect(() => {
    // flagging first load is done
    if (state.firstLoad === false && audioItemsFromServer.value.length > 0) {
      setState((curr) => ({ ...curr, firstLoad: true }));
    }

    // when inference changes, check if there's a new audio to refresh for
    if (inferenceJobs.value.length > 0 && authState.userInfo) {
      const found = inferenceJobs.value.find((job) => {
        if (job.job_status === JobState.COMPLETE_SUCCESS) {
          console.log(job);

          const foundItemOfJob = audioItemsFromServer.value.find((item) => {
            return item.media_id === job.result.entity_token;
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
      />
    );
  }else{
    return(
      <p>Unknown Error</p>
    )
  }
};
