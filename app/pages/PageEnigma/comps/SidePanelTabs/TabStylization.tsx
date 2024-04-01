import { useContext, useState } from "react";

import { Button, H4, ItemPicker, Textarea } from "~/components";

import { AppUiContext } from "../../contexts/AppUiContext";
import { APPUI_ACTION_TYPES, APPUI_VIEW_MODES } from "../../reducers";
import { EngineContext } from "../../contexts/EngineContext";
import { ArtStyle } from "../../js/api_manager";

export const TabStylization = () => {
  const [appUiState, dispatchAppUiState] = useContext(AppUiContext);
  const [selection, setSelection] = useState<string>("Anime");

  const editorEngine = useContext(EngineContext);

  const handlePickingStylizer = (picked: ArtStyle) => {
    console.log(`Picked style: ${picked}`);
    if (editorEngine == null) {
      console.log("Editor is null");
      return;
    }
    editorEngine.art_style = picked;
    setSelection(picked);
  };

  const onChangeHandlerNegative = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    if (editorEngine == null) {
      console.log("Editor is null");
      return;
    }
    editorEngine.negative_prompt = e.target.value;
    console.log(e.target.value);
  };

  const onChangeHandlerPositive = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    if (editorEngine == null) {
      console.log("Editor is null");
      return;
    }
    editorEngine.positive_prompt = e.target.value;
    console.log(e.target.value);
  };
  const handleChangeViewMode = () => {
    if (dispatchAppUiState !== null) {
      dispatchAppUiState({
        type: APPUI_ACTION_TYPES.ON_CHANGE_VIEW_MODE,
        payload: {
          viewMode:
            appUiState?.viewMode === APPUI_VIEW_MODES.SIDE_BY_SIDE
              ? APPUI_VIEW_MODES.EDITOR
              : APPUI_VIEW_MODES.SIDE_BY_SIDE,
        },
      });
    }
  };
  return (
    <div className="h-full w-full gap-2 overflow-scroll">
      <H4>Select Base Stylizer</H4>
      <div className="my-2 flex gap-2">
        <ItemPicker
          label={ArtStyle.Anime2_5D}
          selected={selection === ArtStyle.Anime2DFlat}
          onSelected={handlePickingStylizer}
          src="/resources/avatars/0.webp"
        />
        <ItemPicker
          label={ArtStyle.PixelArt}
          selected={selection === ArtStyle.PixelArt}
          onSelected={handlePickingStylizer}
          src="/resources/avatars/1.webp"
        />
        <ItemPicker
          label={ArtStyle.Cartoon3D}
          selected={selection === ArtStyle.Cartoon3D}
          onSelected={handlePickingStylizer}
          src="/resources/avatars/2.webp"
        />
        <ItemPicker
          label={ArtStyle.ComicBook}
          selected={selection === ArtStyle.ComicBook}
          onSelected={handlePickingStylizer}
          src="/resources/avatars/3.webp"
        />
      </div>
      <H4>Enter a Prompt</H4>
      <div className="my-2 flex gap-2">
        <Textarea
          className="h-32 w-full"
          placeholder="Type here to describe your scene"
          onChange={onChangeHandlerPositive}
        />
      </div>
      <H4>Negative Prompt</H4>
      <div className="my-2 flex gap-2">
        <Textarea
          className="h-32 w-full"
          placeholder="Type here to filter out the things you don't want in the scene"
          onChange={onChangeHandlerNegative}
        />
      </div>
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={handleChangeViewMode}>
          {appUiState?.viewMode === APPUI_VIEW_MODES.SIDE_BY_SIDE
            ? "Back to Scene"
            : "Preview Side by Side"}
        </Button>
      </div>
    </div>
  );
};
