import { useContext, useState } from "react";

import { Button, H4, ItemPicker, Label, Textarea } from "~/components";

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
    <div className="flex h-full w-full flex-col gap-2">
      <div className="flex flex-col">
        <Label>Select Base Style</Label>
        <div className="grid grid-cols-4 gap-2">
          <ItemPicker
            label={ArtStyle.Anime2DFlat}
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
      </div>

      <Textarea
        label="Positive Prompt"
        className="h-32 w-full"
        placeholder="Type here to describe your scene"
        onChange={onChangeHandlerPositive}
        resize="none"
      />
      <Textarea
        label="Negative Prompt"
        className="h-32 w-full"
        placeholder="Type here to filter out the things you don't want in the scene"
        onChange={onChangeHandlerNegative}
        resize="none"
      />
      <div className="mt-3 flex justify-center gap-2">
        <Button onClick={handleChangeViewMode}>
          {appUiState?.viewMode === APPUI_VIEW_MODES.SIDE_BY_SIDE
            ? "Back to Scene"
            : "Preview Side by Side"}
        </Button>
      </div>
    </div>
  );
};
