import { useContext, useState } from 'react';

import {
  Button,
  H4,
  ItemPicker,
  Textarea
} from "~/components"

import { AppUiContext } from '../../contexts/AppUiContext';
import { APPUI_ACTION_TYPES, APPUI_VIEW_MODES } from '../../reducers';
import { EngineContext } from '../../contexts/EngineContext';
import { ArtStyle } from '../../js/api_manager';
export const TabStylization = ()=>{
  const [appUiState, dispatchAppUiState] = useContext(AppUiContext);
  const [ selection, setSelection ] = useState<string>("Anime");

  const editorEngine = useContext(EngineContext);

  const handlePickingStylizer = (picked:string)=>{
    console.log(`Picked style: ${picked}`);

    let selected = ArtStyle.Anime2DFlat
    switch (picked) {
      case "Anime":
        selected = ArtStyle.Anime2DFlat
        break;
      case "Pixel":
        selected = ArtStyle.PixelArt
        break;
      case "Pixar":
        selected = ArtStyle.Cartoon3D
        break;
      case "Stylized":
        selected =  ArtStyle.ComicBook
        break;
    }

    if (editorEngine == null) { console.log("Editor is null"); return;}
    editorEngine.art_style = selected
    console.log(`actual style: ${selected}`);
    setSelection(picked);
  }

  const onChangeHandlerNegative = (e:React.ChangeEvent<HTMLInputElement>) => {
    if (editorEngine == null) { console.log("Editor is null"); return;}
    editorEngine.negative_prompt = e.target.value
    console.log(e.target.value)
  }

  const onChangeHandlerPositive = (e:React.ChangeEvent<HTMLInputElement>) => {
    if (editorEngine == null) { console.log("Editor is null"); return;}
    editorEngine.positive_prompt = e.target.value
    console.log(e.target.value)
  }
  const handleChangeViewMode = ()=>{
    if(dispatchAppUiState!==null){
      dispatchAppUiState({
        type: APPUI_ACTION_TYPES.ON_CHANGE_VIEW_MODE,
        payload: {
          viewMode: appUiState?.viewMode === APPUI_VIEW_MODES.SIDE_BY_SIDE
            ? APPUI_VIEW_MODES.EDITOR : APPUI_VIEW_MODES.SIDE_BY_SIDE,
        }
      })
    }
  }
  return(
    <div className="gap-2 w-full h-full overflow-scroll">
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
          onChange={onChangeHandlerPositive}
        />
      </div>
      <H4>Negative Prompt</H4>
      <div className="flex gap-2 my-2">
        <Textarea
          className="w-full h-32"
          placeholder="Type here to filter out the things you don't want in the scene"
          onChange={onChangeHandlerNegative}
        />
      </div>
      <div className="flex gap-2 mt-6 justify-center">
        <Button onClick={handleChangeViewMode}>
          { 
            appUiState?.viewMode ===  APPUI_VIEW_MODES.SIDE_BY_SIDE 
            ? "Back to Scene" : "Preview Side by Side"
          }
        </Button>
      </div>
    </div>
  );
}