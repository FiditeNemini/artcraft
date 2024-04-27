import { twMerge } from "tailwind-merge";
import { AudioPanelState, AudioTabPages, TtsState, V2VState } from "./types";

import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";
import { PageTTS } from "./pageTTS";
import { PageVoicetoVoice } from "./pageVoiceToVoice";

export const PageAudioGeneration = ({
  sessionToken,
  changePage,
  audioPanelState,
  setAudioPanelState,
}:{
  sessionToken: string;
  changePage: (newPage: AudioTabPages)=>void;
  audioPanelState: AudioPanelState
  setAudioPanelState: React.Dispatch<React.SetStateAction<AudioPanelState>>
}) =>{
  const subpage = audioPanelState.lastWorkingAudioGeneration;
  const changeSubpage = (newSubpage: AudioTabPages.TTS | AudioTabPages.V2V) => {
    setAudioPanelState((curr)=>({
      ...curr,
      lastWorkingAudioGeneration: newSubpage
    }));
  };
  const setTtsState = (newTtsState: TtsState)=>{
    setAudioPanelState((curr)=>({
      ...curr,
      ttsState : {...curr.ttsState, ...newTtsState}
    }));
  };
  const setV2VState = (newV2VState: V2VState)=>{
    setAudioPanelState((curr)=>({
      ...curr,
      v2vState : {...curr.v2vState, ...newV2VState}
    }));
  };
  return(
    <div className="flex flex-col px-4 pt-2">
      <TabTitle title="Generate Audio" onBack={() => changePage(AudioTabPages.LIBRARY)}/>

      <div className="w-full rounded-lg overflow-hidden flex justify-evenly mb-4">
        <button
          className={twMerge(
            "bg-brand-secondary p-2 grow",
            subpage === AudioTabPages.TTS ? "bg-brand-secondary-800": "",)}
          disabled={subpage === AudioTabPages.TTS}
          onClick={()=>changeSubpage(AudioTabPages.TTS)}
        >
          Text to Speech
        </button>
        <button
          className={twMerge(
            "bg-brand-secondary p-2 grow",
            subpage === AudioTabPages.V2V ? "bg-brand-secondary-800": "",)}
          disabled={subpage === AudioTabPages.V2V}
          onClick={()=>{changeSubpage(AudioTabPages.V2V)}}
        >
          Voice to Voice
        </button>
      </div>

      {subpage ===  AudioTabPages.TTS && 
        <PageTTS
          changePage={changePage}
          sessionToken={sessionToken}
          ttsState={audioPanelState.ttsState}
          setTtsState={setTtsState}
        />
      }
      {subpage ===  AudioTabPages.V2V && 
        <PageVoicetoVoice
          changePage={changePage}
          sessionToken={sessionToken}
          v2vState={audioPanelState.v2vState}
          setV2VState={setV2VState}
        />
      }
    </div>
  );
}