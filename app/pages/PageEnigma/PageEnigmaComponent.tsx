import { useContext, useEffect } from "react";

import { AppUiContext } from "~/contexts/AppUiContext";
import { EngineContext } from "~/contexts/EngineContext";
import { PageEditor } from "~/pages/PageEnigma/PageEditor";
import { useParams } from "@remix-run/react";

export const PageEnigmaComponent = () => {
  const [, dispatchAppUiState] = useContext(AppUiContext);
  const editor = useContext(EngineContext);
  const params = useParams();

  useEffect(() => {
    if (editor && editor.can_initialize && dispatchAppUiState !== null) {
      const sceneToken = params["sceneToken"];

      editor.initialize(
        {
          dispatchAppUiState,
        },
        sceneToken,
      );
    }
  }, [editor, dispatchAppUiState, params]);

  return <PageEditor />;
};
