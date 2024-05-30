import { useCallback, useContext } from "react";
import { useSignals } from "@preact/signals-react/runtime";

import { EngineContext } from "~/pages/PageEnigma/contexts/EngineContext";
import { pageHeight, pageWidth } from "~/signals";
import {
  timelineHeight,
  sidePanelWidth,
  sidePanelVisible,
  editorLetterBox,
} from "~/pages/PageEnigma/signals";

import { Letterbox } from "./Letterbox";

export const SceneContainer = ({ children }: { children: React.ReactNode }) => {
  useSignals();
  const editorEngine = useContext(EngineContext);

  const containerWidth =
    pageWidth.value - (sidePanelVisible.value ? sidePanelWidth.value : 0) - 84;

  const containerHeight = pageHeight.value - timelineHeight.value - 68;

  const callbackRef = useCallback(
    (node: HTMLDivElement) => {
      if (node && editorEngine && editorEngine.setSceneContainer) {
        editorEngine.setSceneContainer(node);
      }
    },
    [editorEngine],
  );

  return (
    <div
      ref={callbackRef}
      id="video-scene-container"
      className="relative"
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    >
      {children}
      <Letterbox
        isShowing={editorLetterBox.value}
        width={containerWidth}
        height={containerHeight}
      />
    </div>
  );
};
