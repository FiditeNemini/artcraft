import { useContext, useState } from 'react';

import {
  Button,
  H4,
  ItemPicker,
  Textarea
} from "~/components"

import { AppUiContext } from '../../contexts/AppUiContext';
import { ACTION_TYPES } from '../../reducer';
import { VIEW_MODES } from '../../reducer/types';

export const TabStylization = ()=>{
  const [appUiState, dispatchAppUiState] = useContext(AppUiContext);
  const [ selection, setSelection ] = useState<string>("Anime");
  const handlePickingStylizer = (picked:string)=>{
    console.log(`Picked style: ${picked}`);
    setSelection(picked);
  }


  const handleChangeViewMode = ()=>{
    if(dispatchAppUiState!==null){
      dispatchAppUiState({
        type: ACTION_TYPES.ON_CHANGE_VIEW_MODE,
        payload: {
          viewMode: appUiState?.viewMode === VIEW_MODES.SIDE_BY_SIDE
            ? VIEW_MODES.EDITOR : VIEW_MODES.SIDE_BY_SIDE,
        }
      })
    }
  }
  return(
    <div className="gap-2">
      <H4>Select Base Stylizer</H4>
      <div className="flex gap-2 my-2">
        <ItemPicker
          label="Anime"
          selected={(selection === "Anime")}
          onSelected={handlePickingStylizer}
          src="/resources/avatars/0.webp"
        />
        <ItemPicker
          label="Pixel"
          selected={selection === "Pixel"}
          onSelected={handlePickingStylizer}
          src="/resources/avatars/1.webp"
        />
        <ItemPicker
          label="Pixar"
          selected={selection === "Pixar"}
          onSelected={handlePickingStylizer}
          src="/resources/avatars/2.webp"
        />
        <ItemPicker
          label="Stylized"
          selected={selection === "Stylized"}
          onSelected={handlePickingStylizer}
          src="/resources/avatars/3.webp"
        />
      </div>
      <H4>Enter a Prompt</H4>
      <div className="flex gap-2 my-2">
        <Textarea
          className="w-full h-32"
          placeholder="Type here to describe your scene"
        />
      </div>
      <H4>Negative Prompt</H4>
      <div className="flex gap-2 my-2">
        <Textarea
          className="w-full h-32"
          placeholder="Type here to filter out the things you don't want in the scene
        "/>
      </div>
      <div className="flex gap-2 mt-6 justify-center">
        <Button onClick={handleChangeViewMode}>
          { 
            appUiState?.viewMode ===  VIEW_MODES.SIDE_BY_SIDE 
            ? "Back to Scene" : "Preview Side by Side"
          }
        </Button>
      </div>
    </div>
  );
}