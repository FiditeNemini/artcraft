import { useCallback, useRef } from "react";

// Components
import { KonvaCanvasContainer } from "./KonvaCanvasContainer";
import { ContextualButtonRetry } from "./ContextualButtonRetry";
import { ContextualToolbarImage } from "./ContextualToolbarImage";
import { ContextualLoadingBar } from "./ContextualLoadingBar";
import { SignaledToolbarMain } from "./SignaledToolbarMain";
import { SignaledDialogs } from "./SignaledDialogs";
import {
  SignaledDialogError,
  SignaledCanvasDragDropFiles,
} from "./OtherSignaledComponents";

// The KonvaApp is the root of the Konva stage
// and only entry point for anything in Konva JS
import { EngineType } from "~/KonvaApp";
import { KonvaApp } from "~/KonvaApp";

// all the signal-contexts are wrapped in hooks
import { useAppUiContext } from "./contextSignals/appUi";

// common hooks
import { useRenderCounter } from "~/hooks/useRenderCounter";

export const KonvaRootComponent = ({ className }: { className: string }) => {
  // This is a hook that will log the number of times the component has rerendered
  // Let's make sure we only log once
  useRenderCounter("KonvaRootComponent");
  const appUiContext = useAppUiContext();
  const engineRef = useRef<EngineType | null>(null);

  const konvaContainerCallbackRef = useCallback((node: HTMLDivElement) => {
    if (node !== null && engineRef.current === null) {
      engineRef.current = KonvaApp(node);
    }
  }, []);

  return (
    <>
      <KonvaCanvasContainer
        ref={konvaContainerCallbackRef}
        className={className}
        // retreive the classNames from the parent for sizing/styling
      />
      <SignaledCanvasDragDropFiles
        openAddImage={appUiContext.openAddImage}
        openAddVideo={appUiContext.openAddVideo}
      />
      <SignaledToolbarMain
        openAddImage={appUiContext.openAddImage}
        openAddVideo={appUiContext.openAddVideo}
        openAIStylize={appUiContext.openAIStylize}
      />
      <SignaledDialogs
        appUiSignal={appUiContext.signal}
        resetAll={appUiContext.resetAll}
      />

      <ContextualToolbarImage />
      <ContextualButtonRetry />
      <ContextualLoadingBar />
      <SignaledDialogError />
    </>
  );
};
