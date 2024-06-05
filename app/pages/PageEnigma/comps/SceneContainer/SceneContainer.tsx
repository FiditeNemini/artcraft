import { useCallback } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { pageHeight, pageWidth } from "~/signals";
import {
  editorLetterBox,
  timelineHeight,
  sidePanelWidth,
  sidePanelVisible,
} from "~/pages/PageEnigma/signals";
import Editor from "~/pages/PageEnigma/Editor/editor";
import { Letterbox } from "./Letterbox";

export const SceneContainer = ({ children }: { children: React.ReactNode }) => {
  useSignals();

  const containerWidth =
    pageWidth.value - (sidePanelVisible.value ? sidePanelWidth.value : 0) - 84;

  const containerHeight = pageHeight.value - timelineHeight.value - 68;

  const callbackRef = useCallback((node: HTMLDivElement) => {
    if (node) {
      // Editor.onSceneContainerChange(node); TODO FIX
    }
  }, []);

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
