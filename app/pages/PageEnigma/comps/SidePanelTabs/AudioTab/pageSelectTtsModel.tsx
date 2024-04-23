
import { useState } from 'react'
import { faChevronLeft } from "@fortawesome/pro-solid-svg-icons";

import { H2, ButtonIcon, Input } from "~/components";
import { AudioTabPages } from "./types";

import { TtsModelListItem } from "~/pages/PageEnigma/models/tts";
import { VoiceModelElement } from "./voiceModelElement";

export const PageSelectTtsModel = ({
  changePage,
  ttsModels,
  onSelect
}:{
  changePage: (newPage:AudioTabPages)=>void;
  ttsModels: Array<TtsModelListItem>;
  onSelect: (item:TtsModelListItem)=>void;
})=>{
  const [query, setQuery] = useState('');
  const filteredListOfModels = query === ''
  ? ttsModels
  : ttsModels.filter((model) =>{
      return model.title
        .toLowerCase()
        .replace(/\s+/g, '')
        .includes(query.toLowerCase().replace(/\s+/g, ''));
    })

  const slicedArray = filteredListOfModels.slice(0, 20);

  return(
    <div className="flex flex-col px-4 pt-2">
      <div className="pb-4 flex items-center gap-3">
        <ButtonIcon
          className="w-auto p-0 text-xl opacity-60 hover:opacity-40"
          icon={faChevronLeft}
          onClick={() => changePage(AudioTabPages.TTS)}
        />
        <H2 className="font-semibold">Search TTS Voices</H2>
      </div>
      <Input
        className="mb-4"
        placeholder="Search Voice by Name"
        onChange={(e)=>setQuery(e.target.value)}
      />
      <div className="flex flex-col gap-3">
        {slicedArray.map((item)=>{
          return(
            <VoiceModelElement
              model={item}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
}