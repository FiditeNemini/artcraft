import { useCallback, useContext } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { EngineContext } from "../contexts/EngineContext";
import { pageHeight, pageWidth } from "~/signals";
import {
  timelineHeight,
  sidePanelWidth,
  sidePanelVisible,
} from "~/pages/PageEnigma/signals";

export const SceneContainer = ({ children }: { children: React.ReactNode }) => {
  useSignals();
  const editorEngine = useContext(EngineContext);

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
        width:
          pageWidth.value -
          (sidePanelVisible.value ? sidePanelWidth.value : 0) -
          84,
        height: pageHeight.value - timelineHeight.value - 68,
      }}
    >
      {children}
    </div>
  );
};
