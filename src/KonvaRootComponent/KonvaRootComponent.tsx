import { useCallback, useRef } from "react";
import { useRenderCounter } from "~/hooks/useRenderCounter";

import { KonvaCanvasContainer } from "./KonvaCanvasContainer";
import { ContextualButtonRetry } from "./ContextualButtonRetry";
import { ContextualToolbarImage } from "./ContextualToolbarImage";
import { ContextualLoadingBar } from "./ContextualLoadingBar";
import { SignaledToolbarMain } from "./SignaledToolbarMain";
import { SignaledDialogError } from "./SignaledComponents";
import { EngineType } from "~/KonvaApp";

// The KonvaApp is the root of the Konva stage
// and only entry point for anything in Konva JS
import { KonvaApp } from "~/KonvaApp";

import { Button } from "~/components/ui";
import { uiAccess } from "~/signals";

export const KonvaRootComponent = ({ className }: { className: string }) => {
  // This is a hook that will log the number of times the component has rerendered
  // Let's make sure we only log once
  useRenderCounter("KonvaRootComponent");

  const engineRef = useRef<EngineType | null>(null);

  const konvaContainerCallbackRef = useCallback((node: HTMLDivElement) => {
    if (node !== null && engineRef.current === null) {
      engineRef.current = KonvaApp(node);
    }
  }, []);

  return (
    <>
      <Button
        className="absolute bottom-0 left-0"
        onClick={() => {
          uiAccess.dialogueError.show({
            title: "Test Error",
            message: "This is a test error",
          });
        }}
      >
        Error Dialogue Test
      </Button>
      <KonvaCanvasContainer
        ref={konvaContainerCallbackRef}
        className={className}
        // retreive the classNames from the parent for sizing/styling
      />
      <SignaledToolbarMain />
      <ContextualToolbarImage />
      <ContextualButtonRetry />
      <ContextualLoadingBar />
      <SignaledDialogError />
    </>
  );
};
