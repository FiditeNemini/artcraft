import { useSignals } from "@preact/signals-react/runtime";
import { PageStylizationComponent } from "~/pages/PageStylization/PageStylizationComponent";
import { useContext, useEffect } from "react";
import { AppUiContext } from "~/contexts/AppUiContext";
import { EngineContext } from "~/contexts/EngineContext";

export const PageStylization = () => {
  useSignals();

  const [, dispatchAppUiState] = useContext(AppUiContext);
  const editor = useContext(EngineContext);

  useEffect(() => {
    if (editor && editor.can_initialize && dispatchAppUiState !== null) {
      console.log("initializing Editor");
      editor.initialize({
        dispatchAppUiState,
      });
    }
  }, [editor, dispatchAppUiState]);

  return <PageStylizationComponent />;
};
