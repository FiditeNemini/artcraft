import { useContext, useEffect, useState } from "react";

import { AppUiContext } from "~/contexts/AppUiContext";
import { EngineContext } from "~/contexts/EngineContext";
import { PageEditor } from "~/pages/PageEnigma/PageEditor";
import { PageStyling } from "~/pages/PageEnigma/PageStyling";
import { useParams } from "@remix-run/react";
import { Pages } from "~/pages/PageEnigma/constants/page";

export const PageEnigmaComponent = () => {
  const [, dispatchAppUiState] = useContext(AppUiContext);
  const editor = useContext(EngineContext);
  const [page, setPage] = useState<Pages>(Pages.EDIT);
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

  return (
    <>
      <div className={page === Pages.EDIT ? "visible" : "hidden"}>
        <PageEditor setPage={setPage} />
      </div>
      <div className={page === Pages.STYLE ? "visible" : "hidden"}>
        <PageStyling setPage={setPage} />
      </div>
    </>
  );
};
