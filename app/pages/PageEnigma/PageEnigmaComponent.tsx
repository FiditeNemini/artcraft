import { useContext, useEffect, useState } from "react";

import { useSignals } from "@preact/signals-react/runtime";
import { AppUiContext } from "~/contexts/AppUiContext";
import { EngineContext } from "~/contexts/EngineContext";
import { PageEditor } from "~/pages/PageEnigma/PageEditor";
import { PageStyling } from "~/pages/PageEnigma/PageStyling";
import { useParams } from "@remix-run/react";

export const PageEnigmaComponent = () => {
  useSignals();

  const [, dispatchAppUiState] = useContext(AppUiContext);
  const editor = useContext(EngineContext);
  const [page, setPage] = useState("edit");
  const params = useParams();

  useEffect(() => {
    if (editor && editor.can_initialize && dispatchAppUiState !== null) {
      console.log("initializing Editor");

      const sceneToken = params["sceneToken"];

      editor.initialize(
        {
          dispatchAppUiState,
        },
        sceneToken,
      );
    }
  }, [editor, dispatchAppUiState]);

  return (
    <>
      <div className={page === "edit" ? "visible" : "hidden"}>
        <PageEditor setPage={setPage} />
      </div>
      <div className={page === "style" ? "visible" : "hidden"}>
        <PageStyling setPage={setPage} />
      </div>
    </>
  );
};
