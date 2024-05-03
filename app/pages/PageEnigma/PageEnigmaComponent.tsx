import { useContext, useEffect } from "react";
import { AuthenticationContext } from "~/contexts/Authentication";
import { AppUiContext } from "~/contexts/AppUiContext";
import { EngineContext } from "~/contexts/EngineContext";
import { PageEditor } from "~/pages/PageEnigma/PageEditor";
import { signalScene } from "~/store";

export const PageEnigmaComponent = ({
  sceneToken
}: {
  sceneToken?: string;
}) => {
  const editor = useContext(EngineContext);

  useEffect(() => {
    if (editor && editor.can_initialize) {
      editor.initialize({
        sceneToken: sceneToken || ""}
      );
    }
  }, [editor, sceneToken]);

  return <PageEditor />;
};
