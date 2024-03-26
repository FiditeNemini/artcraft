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

export const TabStyling = ()=>{
  const [pageState, dispatchPageState] = useContext(AppUiContext);
  const [ selection, setSelection ] = useState<string>("Anime");
  const handlePickingStyle = (picked:string)=>{
    console.log(`Picked style: ${picked}`);
    setSelection(picked);
  }


  const handleChangeViewMode = ()=>{
    if(dispatchPageState!==null)
      dispatchPageState({
        type: ACTION_TYPES.ON_CHANGE_VIEW_MODE,
        payload: {
          viewMode: pageState?.viewMode === VIEW_MODES.SIDE_BY_SIDE
            ? VIEW_MODES.EDITOR : VIEW_MODES.SIDE_BY_SIDE,
        }
      })
  }
  return(
    <>
      <H4>Select Base Style</H4>
      <div className="flex gap-2 my-2">
        <ItemPicker
          label="Anime"
          selected={(selection === "Anime")}
          onSelected={handlePickingStyle}
          src="/resources/avatars/0.webp"
        />
        <ItemPicker
          label="Pixel"
          selected={selection === "Pixel"}
          onSelected={handlePickingStyle}
          src="/resources/avatars/1.webp"
        />
        <ItemPicker
          label="Pixar"
          selected={selection === "Pixar"}
          onSelected={handlePickingStyle}
          src="/resources/avatars/2.webp"
        />
        <ItemPicker
          label="Stylized"
          selected={selection === "Stylized"}
          onSelected={handlePickingStyle}
          src="/resources/avatars/3.webp"
        />
      </div>
      <H4>Enter a Prompt</H4>
      <div className="flex gap-2 my-2">
        <Textarea className="w-full h-32"/>
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
            pageState?.viewMode ===  VIEW_MODES.SIDE_BY_SIDE 
            ? "Back to Scene" : "Preview Side by Side"
          }
        </Button>
      </div>
    </>
  );
}