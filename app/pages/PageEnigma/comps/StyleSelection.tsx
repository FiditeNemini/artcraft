import { useContext, useState } from "react";

import { ButtonIcon, ItemPicker, Label, Textarea } from "~/components";

import { EngineContext } from "~/contexts/EngineContext";
import { ArtStyle } from "~/pages/PageEnigma/js/api_manager";
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { styleList } from "~/pages/PageEnigma/styleList";

export const StyleSelection = () => {
  const [selection, setSelection] = useState<ArtStyle>(styleList[0].type);
  const [scrollPosition, setScrollPosition] = useState(0);

  const editorEngine = useContext(EngineContext);

  const handlePickingStylizer = (picked: ArtStyle) => {
    console.log(`Picked style: ${picked}`);
    setSelection(picked);
    if (editorEngine === null) {
      console.log("Editor is null");
      return;
    }
    editorEngine.art_style = picked;
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

  return (
    <div className="flex h-[280px] w-[800px] flex-col gap-3 rounded-lg bg-ui-panel p-4">
      <div className="flex w-full flex-col">
        <Label>Select Base Style</Label>
        <div
          className="relative overflow-x-hidden"
          style={{ width: 768, height: 80 }}
        >
          <div
            className="absolute flex gap-2"
            style={{
              width: styleList.length * 84 + 26,
              left: scrollPosition * -86,
              top: 0,
            }}
          >
            {styleList.map((style) => (
              <ItemPicker
                key={style.type}
                label={style.label}
                type={style.type}
                selected={selection === style.type}
                onSelected={handlePickingStylizer}
                src={style.image}
                width={80}
                height={80}
              />
            ))}
          </div>
          {scrollPosition > 0 && (
            <div className="absolute left-3 top-5">
              <ButtonIcon
                icon={faAngleLeft}
                onClick={() =>
                  setScrollPosition(Math.max(scrollPosition - 6, 0))
                }
              />
            </div>
          )}
          {scrollPosition < styleList.length - 9 && (
            <div className="absolute right-3 top-5">
              <ButtonIcon
                icon={faAngleRight}
                onClick={() =>
                  setScrollPosition(
                    Math.min(scrollPosition + 6, styleList.length - 9),
                  )
                }
                fill
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full gap-4">
        <Textarea
          label="Positive Prompt"
          className="h-24 w-[376px]"
          name="positive-prompt"
          placeholder="Type here to describe your scene"
          onChange={onChangeHandlerPositive}
          resize="none"
        />
        <Textarea
          label="Negative Prompt"
          className="h-24 w-[376px]"
          name="negative-prompt"
          placeholder="Type here to filter out the things you don't want in the scene"
          onChange={onChangeHandlerNegative}
          resize="none"
        />
      </div>
    </div>
  );
};
