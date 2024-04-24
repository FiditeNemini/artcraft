
import { useCallback, useState } from 'react'
import { faChevronLeft } from "@fortawesome/pro-solid-svg-icons";

import { H2, ButtonIcon, Input } from "~/components";
import { AudioTabPages } from "./types";

import { VoiceModelElement } from "./voiceModelElement";
import { VoiceConversionModelListItem } from './typesImported';

export const PageSelectV2VModel = ({
  changePage,
  v2vModels,
  onSelect
}:{
  changePage: (newPage:AudioTabPages)=>void;
  v2vModels: Array<VoiceConversionModelListItem>;
  onSelect: (item:VoiceConversionModelListItem)=>void;
})=>{
  const [query, setQuery] = useState('');
  const filteredListOfModels = query === ''
  ? v2vModels
  : v2vModels.filter((model) =>{
      return model.title
        .toLowerCase()
        .replace(/\s+/g, '')
        .includes(query.toLowerCase().replace(/\s+/g, ''));
    })

  const slicedArray = filteredListOfModels.slice(0, 20);

  const refCallback = useCallback((node:HTMLInputElement)=>{
    if(node) node.focus();
    //auto focus on the mounting on the input component
  },[]);

  return(
    <div className="flex flex-col px-4 pt-2">
      <div className="pb-4 flex items-center gap-3">
        <ButtonIcon
          className="w-auto p-0 text-xl opacity-60 hover:opacity-40"
          icon={faChevronLeft}
          onClick={() => changePage(AudioTabPages.V2V)}
        />
        <H2 className="font-semibold">Search Convertible Voices</H2>
      </div>
      <Input
        ref={refCallback}
        className="mb-4"
        placeholder="Search Voice by Name"
        onChange={(e)=>setQuery(e.target.value)}
      />
      <div className="flex flex-col gap-3">
        {slicedArray.map((item)=>{
          return(
            <VoiceModelElement
              model={item}
              onSelect={(item)=>onSelect(item as VoiceConversionModelListItem)}
            />
          );
        })}
      </div>
    </div>
  );
}