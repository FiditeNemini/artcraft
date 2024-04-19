import { useContext, useState } from "react";

import { ButtonIcon } from "~/components";

import { EngineContext } from "~/contexts/EngineContext";
import { ArtStyle } from "~/pages/PageEnigma/js/api_manager";
import { faAngleLeft, faAngleRight } from "@fortawesome/pro-solid-svg-icons";
import { styleList } from "~/pages/PageEnigma/styleList";
import { sidePanelWidth } from "~/pages/PageEnigma/store";
import { ItemPicker } from "./ItemPicker";
import { useSignals } from "@preact/signals-react/runtime";

export const StyleSelection = () => {
  useSignals();
  const [selection, setSelection] = useState<ArtStyle>(styleList[0].type);
  const [scrollPosition, setScrollPosition] = useState(0);

  const shownImageCount = Math.floor((sidePanelWidth.value - 32) / 98);
  const imageWidth =
    90 + (sidePanelWidth.value - 32 - shownImageCount * 98) / shownImageCount;
  const imageHeight = (54 * imageWidth) / 90;

  console.log(
    "image",
    shownImageCount,
    sidePanelWidth.value,
    imageWidth,
    imageHeight,
  );

  const editorEngine = useContext(EngineContext);

  const handlePickingStylizer = (picked: ArtStyle) => {
    setSelection(picked);
    if (editorEngine === null) {
      console.log("Editor is null");
      return;
    }
    editorEngine.art_style = picked;
  };

  return (
    <div className="flex flex-col gap-4 rounded-t-lg bg-ui-panel">
      <div className="flex flex-col">
        <div className="relative">
          <div
            className="relative overflow-hidden"
            style={{
              width: sidePanelWidth.value - 32,
              height: imageHeight * 2 + 16,
            }}>
            <div
              className="absolute flex flex-col gap-1 transition-all duration-300 ease-in-out"
              style={{
                width: styleList.length * 54,
                left: scrollPosition * (imageWidth + 8) * -1,
                top: 0,
              }}>
              <div className="flex gap-1">
                {styleList
                  .filter((_, index) => index % 2 === 0)
                  .map((style) => (
                    <ItemPicker
                      key={style.type}
                      label={style.label}
                      type={style.type}
                      selected={selection === style.type}
                      onSelected={handlePickingStylizer}
                      src={style.image}
                      width={imageWidth}
                      height={imageHeight}
                    />
                  ))}
              </div>
              <div className="flex gap-1">
                {styleList
                  .filter((_, index) => index % 2 === 1)
                  .map((style) => (
                    <ItemPicker
                      key={style.type}
                      label={style.label}
                      type={style.type}
                      selected={selection === style.type}
                      onSelected={handlePickingStylizer}
                      src={style.image}
                      width={imageWidth}
                      height={imageHeight}
                    />
                  ))}
              </div>
            </div>
          </div>
          {scrollPosition > 0 && (
            <div className="pointer-events-none absolute left-[-10px] top-0 h-full w-12">
              <div className="flex h-full w-full items-center justify-start">
                <ButtonIcon
                  icon={faAngleLeft}
                  onClick={() =>
                    setScrollPosition(
                      Math.max(
                        scrollPosition - Math.max(shownImageCount - 1, 1),
                        0,
                      ),
                    )
                  }
                  className="pointer-events-auto h-6 w-6 rounded-full bg-white/80 text-gray-800/75 hover:bg-white/100 hover:text-gray-800"
                />
              </div>
            </div>
          )}
          {scrollPosition < styleList.length / 2 - shownImageCount && (
            <div className="pointer-events-none absolute right-[-32px] top-0 h-full w-12">
              <div className="flex h-full w-full items-center justify-end pr-6">
                <ButtonIcon
                  icon={faAngleRight}
                  onClick={() =>
                    setScrollPosition(
                      Math.min(
                        scrollPosition + Math.max(shownImageCount - 1, 1),
                        styleList.length - 3,
                      ),
                    )
                  }
                  className="pointer-events-auto h-6 w-6 rounded-full bg-white/80 text-gray-800/75 hover:bg-white/100 hover:text-gray-800"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
