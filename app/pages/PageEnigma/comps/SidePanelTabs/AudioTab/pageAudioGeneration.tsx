import { twMerge } from "tailwind-merge";
import { AudioTabPages, VoiceConversionModelListItem } from "./types";

import {
  faChevronLeft,
} from "@fortawesome/pro-solid-svg-icons";

import { ButtonIcon, H2, } from "~/components";
import { TtsModelListItem, } from "~/pages/PageEnigma/models/tts";

import { PageTTS } from "./pageTTS";
import { PageVoicetoVoice } from "./pageVoiceToVoice";

export const PageAudioGeneration = ({
  page,
  changePage,
  sessionToken,
  ttsModels,
  v2vModels,
}:{
  page: AudioTabPages;
  changePage: (newPage:AudioTabPages) => void;
  sessionToken: string;
  ttsModels: Array<TtsModelListItem>;
  v2vModels: Array<VoiceConversionModelListItem>
}) =>{
  return(
    <div className="flex flex-col px-4 pt-2">
      <div className="pb-4 flex items-center gap-3">
        <ButtonIcon
          className="w-auto p-0 text-xl opacity-60 hover:opacity-40"
          icon={faChevronLeft}
          onClick={() => changePage(AudioTabPages.LIBRARY)}
        />
        <H2 className="font-semibold">Generate Audio</H2>
      </div>

      <div className="w-full rounded-lg overflow-hidden flex justify-evenly mb-4">
        <button
          className={twMerge(
            "bg-brand-secondary p-2 grow",
            page === AudioTabPages.TTS ? "bg-brand-secondary-800": "",)}
          disabled={page === AudioTabPages.TTS}
          onClick={()=>changePage(AudioTabPages.TTS)}
        >
          Text to Speech
        </button>
        <button
          className={twMerge(
            "bg-brand-secondary p-2 grow",
            page === AudioTabPages.V2V ? "bg-brand-secondary-800": "",)}
          disabled={page === AudioTabPages.V2V}
          onClick={()=>{changePage(AudioTabPages.V2V)}}
        >
          Voice to Voice
        </button>
      </div>

      {page ===  AudioTabPages.TTS && 
        <PageTTS
          changePage={changePage}
          sessionToken={sessionToken}
          ttsModels={ttsModels}
        />
      }
      {page ===  AudioTabPages.V2V && 
        <PageVoicetoVoice
          changePage={changePage}
          sessionToken={sessionToken}
          v2vModels={v2vModels}
        />
      }
    </div>
  );
}