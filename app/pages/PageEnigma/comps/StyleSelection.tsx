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
    <div className="flex flex-col gap-4 rounded-t-lg bg-ui-panel p-5">
      <div className="flex w-full flex-col">
        <Label>Select Base Style</Label>
        <div className="relative">
          <div
            className="relative overflow-x-hidden"
            style={{ width: 768, height: 80 }}
          >
            <div
              className="absolute flex gap-2 transition-all duration-300 ease-in-out"
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
          </div>
          {scrollPosition > 0 && (
            <div className="pointer-events-none absolute left-[-10px] top-0 h-full w-12 bg-gradient-to-r from-ui-panel to-transparent">
              <div className="flex h-full w-full items-center justify-start">
                <ButtonIcon
                  icon={faAngleLeft}
                  onClick={() =>
                    setScrollPosition(Math.max(scrollPosition - 6, 0))
                  }
                  className="pointer-events-auto h-6 w-6 rounded-full bg-white/80 text-gray-800/75 hover:bg-white/100 hover:text-gray-800"
                />
              </div>
            </div>
          )}
          {scrollPosition < styleList.length - 9 && (
            <div className="pointer-events-none absolute right-[-10px] top-0 h-full w-12 bg-gradient-to-l from-ui-panel to-transparent">
              <div className="flex h-full w-full items-center justify-end">
                <ButtonIcon
                  icon={faAngleRight}
                  onClick={() =>
                    setScrollPosition(
                      Math.min(scrollPosition + 6, styleList.length - 9),
                    )
                  }
                  className="pointer-events-auto h-6 w-6 rounded-full bg-white/80 text-gray-800/75 hover:bg-white/100 hover:text-gray-800"
                />
              </div>
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
